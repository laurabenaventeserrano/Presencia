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

import { sampleTaskTitles } from './seed/tasks'
import { dayKey, getActiveBlock, migrateFocusState, useFocusStore } from './store'

const NOW = new Date(2026, 9, 8, 10, 0, 0)
const initialState = useFocusStore.getState()

const todayBlocks = () => useFocusStore.getState().days[dayKey()]?.blocks ?? []
const tasks = () => useFocusStore.getState().tasks

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
    const { addTask, selectTask, setDuration, start } = useFocusStore.getState()
    addTask('Leer el informe')
    addTask('Pagar facturas')
    const [first] = tasks()
    selectTask(first.id)
    setDuration(45)
    start()
    expect(todayBlocks()[0]).toMatchObject({ taskId: first.id, title: 'Leer el informe', plannedMin: 45 })
  })
})

describe('tareas', () => {
  it('una instalación nueva empieza sin tareas', () => {
    expect(tasks()).toEqual([])
  })

  it('addTask calcula el tipo y los minutos por defecto, o usa los que se le dan', () => {
    const { addTask } = useFocusStore.getState()
    addTask('  Diseñar la pantalla  ')
    addTask('Responder emails', 30)
    expect(tasks()).toMatchObject([
      { title: 'Diseñar la pantalla', kind: 'deep', estimatedMin: 50, done: false, createdAt: NOW.getTime() },
      { title: 'Responder emails', kind: 'admin', estimatedMin: 30, done: false },
    ])
    expect(useFocusStore.getState().days[dayKey()].taskIds).toEqual(tasks().map((task) => task.id))
  })

  it('addTask ignora un título vacío', () => {
    useFocusStore.getState().addTask('   ')
    expect(tasks()).toEqual([])
  })

  it('setTaskMinutes cambia solo los minutos de esa tarea', () => {
    const { addTask, setTaskMinutes } = useFocusStore.getState()
    addTask('Leer')
    addTask('Escribir')
    setTaskMinutes(tasks()[0].id, 40)
    expect(tasks().map((task) => task.estimatedMin)).toEqual([40, 50])
  })

  it('toggleTaskDone marca y desmarca una tarea', () => {
    const { addTask, toggleTaskDone } = useFocusStore.getState()
    addTask('Leer')
    const id = tasks()[0].id
    toggleTaskDone(id)
    expect(tasks()[0].done).toBe(true)
    toggleTaskDone(id)
    expect(tasks()[0].done).toBe(false)
  })

  it('deleteTask la quita de la lista y del día, y sus bloques conservan el título', () => {
    const { addTask, deleteTask, startBlock } = useFocusStore.getState()
    addTask('Leer')
    const [task] = tasks()
    startBlock({ title: task.title, minutes: 25, taskId: task.id })
    deleteTask(task.id)
    expect(tasks()).toEqual([])
    expect(useFocusStore.getState().days[dayKey()].taskIds).toEqual([])
    expect(useFocusStore.getState().selectedTaskId).toBe('')
    expect(todayBlocks()[0].title).toBe('Leer')
  })

  it('loadSampleTasks carga los ejemplos solo si la lista está vacía', () => {
    const { addTask, loadSampleTasks } = useFocusStore.getState()
    loadSampleTasks()
    expect(tasks().map((task) => task.title)).toEqual(sampleTaskTitles)

    useFocusStore.setState(initialState, true)
    addTask('Mía')
    loadSampleTasks()
    expect(tasks().map((task) => task.title)).toEqual(['Mía'])
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
    expect(migrated.tasks).toEqual([{ id: 't', title: 'Leer', createdAt: 0, kind: 'review', estimatedMin: 25, done: false }])
    expect(migrated.days?.['2026-10-07'].blocks).toEqual([
      { ...v1.days['2026-10-07'].blocks[0], title: 'Leer', kind: 'focus', plannedMin: 25 },
      { ...v1.days['2026-10-07'].blocks[1], title: '', kind: 'focus', plannedMin: 10 },
    ])
  })

  it('de v2 rellena las tareas sin tocar los bloques', () => {
    const day = { date: '2026-10-07', taskIds: ['t'], blocks: [] }
    const v2 = { tasks: [{ id: 't', title: 'Diseñar la pantalla', createdAt: 5 }], days: { [day.date]: day } }
    const migrated = migrateFocusState(v2, 2)
    expect(migrated.tasks).toEqual([{ id: 't', title: 'Diseñar la pantalla', createdAt: 5, kind: 'deep', estimatedMin: 50, done: false }])
    expect(migrated.days).toEqual(v2.days)
  })

  it('no toca un estado que ya es de la versión actual', () => {
    const current = { tasks: [], days: {}, selectedTaskId: '', durationMinutes: 25 }
    expect(migrateFocusState(current, 3)).toBe(current)
  })
})
