import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Node no trae un localStorage usable: el store persiste en uno en memoria.
vi.hoisted(() => {
  const data = new Map<string, string>()
  const memoryStorage: Storage = {
    get length() { return data.size },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => { data.delete(key) },
    setItem: (key, value) => { data.set(key, value) },
  }
  Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage, configurable: true })
})

import { dayKey, getActiveBlock, migrateFocusState, useFocusStore } from './store'

const NOW = new Date(2026, 9, 8, 10, 0, 0)
const initialState = useFocusStore.getState()

const todayBlocks = () => useFocusStore.getState().days[dayKey()]?.blocks ?? []

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
  useFocusStore.setState(initialState, true)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('startBlock', () => {
  it('crea un bloque en marcha que termina en endsAt = ahora + minutos', () => {
    useFocusStore.getState().startBlock({ title: 'Diseñar la pantalla', minutes: 35 })
    const [block] = todayBlocks()
    expect(block).toMatchObject({
      title: 'Diseñar la pantalla',
      kind: 'focus',
      plannedMin: 35,
      status: 'running',
      startedAt: NOW.getTime(),
      endsAt: NOW.getTime() + 35 * 60_000,
      durationSeconds: 35 * 60,
    })
    expect(block.taskId).toBeUndefined()
  })

  it('no crea ninguna tarea', () => {
    const tasksBefore = useFocusStore.getState().tasks
    useFocusStore.getState().startBlock({ title: 'Llamar al banco', minutes: 15 })
    expect(useFocusStore.getState().tasks).toEqual(tasksBefore)
  })

  it('no empieza otro si ya hay uno en marcha o en pausa', () => {
    const { startBlock, pause } = useFocusStore.getState()
    startBlock({ title: 'Primero', minutes: 25 })
    startBlock({ title: 'Segundo', minutes: 25 })
    expect(todayBlocks()).toHaveLength(1)

    pause()
    startBlock({ title: 'Tercero', minutes: 25 })
    expect(todayBlocks()).toHaveLength(1)
    expect(getActiveBlock(todayBlocks())?.title).toBe('Primero')
  })

  it('start() sigue empezando la tarea elegida con los minutos elegidos', () => {
    const { selectTask, setDuration, start, tasks } = useFocusStore.getState()
    selectTask(tasks[1].id)
    setDuration(45)
    start()
    expect(todayBlocks()[0]).toMatchObject({ taskId: tasks[1].id, title: tasks[1].title, plannedMin: 45 })
  })
})

describe('migrateFocusState', () => {
  it('de v1 da a cada bloque el título de su tarea, tipo foco y sus minutos', () => {
    const v1 = {
      tasks: [{ id: 't', title: 'Leer', createdAt: 0 }],
      days: {
        '2026-10-07': {
          date: '2026-10-07',
          taskIds: ['t'],
          blocks: [
            { id: 'b1', taskId: 't', startedAt: 0, endsAt: null, durationSeconds: 1500, remainingSeconds: 0, status: 'completed' },
            { id: 'b2', taskId: 'borrada', startedAt: 0, endsAt: null, durationSeconds: 600, remainingSeconds: 0, status: 'cancelled' },
          ],
        },
      },
      selectedTaskId: 't',
      durationMinutes: 25,
    }
    const migrated = migrateFocusState(v1, 1)
    expect(migrated.tasks).toEqual(v1.tasks)
    expect(migrated.days?.['2026-10-07'].blocks).toEqual([
      { ...v1.days['2026-10-07'].blocks[0], title: 'Leer', kind: 'focus', plannedMin: 25 },
      { ...v1.days['2026-10-07'].blocks[1], title: '', kind: 'focus', plannedMin: 10 },
    ])
  })

  it('no toca un estado que ya es de la versión actual', () => {
    const current = { tasks: [], days: {}, selectedTaskId: '', durationMinutes: 25 }
    expect(migrateFocusState(current, 2)).toBe(current)
  })
})
