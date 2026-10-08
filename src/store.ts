import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { BlockKind } from './ai/types'

export type Task = {
  id: string
  title: string
  createdAt: number
}

export type Block = {
  id: string
  taskId?: string
  title: string
  kind: BlockKind
  plannedMin: number
  startedAt: number
  endsAt: number | null
  durationSeconds: number
  remainingSeconds: number
  status: 'running' | 'paused' | 'completed' | 'cancelled'
  completedSeconds?: number
  completedAt?: number
}

export type Day = {
  date: string
  taskIds: string[]
  blocks: Block[]
}

export type Memory = {
  id: string
  text: string
  createdAt: number
  type: 'franja' | 'duracion' | 'arrastre'
}

export type StartBlockInput = {
  title: string
  minutes: number
  taskId?: string
}

type FocusState = {
  tasks: Task[]
  days: Record<string, Day>
  selectedTaskId: string
  durationMinutes: number
  addTask: (title: string) => void
  selectTask: (taskId: string) => void
  setDuration: (minutes: number) => void
  start: () => void
  startBlock: (input: StartBlockInput) => void
  pause: () => void
  resume: () => void
  finish: () => void
  reset: () => void
}

export const dayKey = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const initialTasks: Task[] = [
  { id: 'task-writing', title: 'Escribir sin interrupciones', createdAt: Date.now() },
  { id: 'task-reading', title: 'Leer y tomar notas', createdAt: Date.now() },
  { id: 'task-planning', title: 'Planificar la semana', createdAt: Date.now() },
]

const currentDay = (): Day => ({
  date: dayKey(),
  taskIds: initialTasks.map((task) => task.id),
  blocks: [],
})

export const getActiveBlock = (blocks: Block[]) => [...blocks].reverse().find(
  (block) => block.status === 'running' || block.status === 'paused',
)

type BlockV1 = Omit<Block, 'title' | 'kind' | 'plannedMin'>

type PersistedFocusState = Partial<Pick<FocusState, 'tasks' | 'days' | 'selectedTaskId' | 'durationMinutes'>>

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

// v1 → v2: los bloques guardan su título, su tipo y sus minutos para no depender de una tarea.
const migrateBlock = (block: BlockV1, tasks: readonly Task[]): Block => ({
  ...block,
  title: tasks.find((task) => task.id === block.taskId)?.title ?? '',
  kind: 'focus',
  plannedMin: Math.round(block.durationSeconds / 60),
})

export const migrateFocusState = (persisted: unknown, version: number): PersistedFocusState => {
  if (!isRecord(persisted)) return {}
  const state = persisted as PersistedFocusState
  if (version >= 2) return state
  const tasks = state.tasks ?? []
  const oldDays = (state.days ?? {}) as Record<string, Omit<Day, 'blocks'> & { blocks: BlockV1[] }>
  const days = Object.fromEntries(Object.entries(oldDays).map(([date, day]) => [
    date,
    { ...day, blocks: day.blocks.map((block) => migrateBlock(block, tasks)) },
  ]))
  return { ...state, days }
}

const getToday = (days: Record<string, Day>) => days[dayKey()] ?? currentDay()

const updateToday = (days: Record<string, Day>, update: (day: Day) => Day) => {
  const today = getToday(days)
  return { ...days, [today.date]: update(today) }
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      tasks: initialTasks,
      days: { [dayKey()]: currentDay() },
      selectedTaskId: initialTasks[0].id,
      durationMinutes: 25,
      addTask: (title) => {
        const trimmedTitle = title.trim()
        if (!trimmedTitle) return
        const task = { id: crypto.randomUUID(), title: trimmedTitle, createdAt: Date.now() }
        set((state) => ({
          tasks: [...state.tasks, task],
          days: updateToday(state.days, (day) => ({ ...day, taskIds: [...day.taskIds, task.id] })),
          selectedTaskId: task.id,
        }))
      },
      selectTask: (taskId) => set({ selectedTaskId: taskId }),
      setDuration: (durationMinutes) => set({ durationMinutes }),
      start: () => {
        const { selectedTaskId, durationMinutes, tasks } = get()
        const title = tasks.find((task) => task.id === selectedTaskId)?.title ?? ''
        get().startBlock({ title, minutes: durationMinutes, taskId: selectedTaskId || undefined })
      },
      // La única forma de empezar un bloque: desde la propuesta, desde una tarea o desde el reloj.
      startBlock: ({ title, minutes, taskId }) => {
        const { days } = get()
        if (getActiveBlock(getToday(days).blocks)) return
        const now = Date.now()
        const durationSeconds = minutes * 60
        const block: Block = {
          id: crypto.randomUUID(),
          taskId,
          title,
          kind: 'focus',
          plannedMin: minutes,
          startedAt: now,
          endsAt: now + durationSeconds * 1000,
          durationSeconds,
          remainingSeconds: durationSeconds,
          status: 'running',
        }
        set({ days: updateToday(days, (day) => ({ ...day, blocks: [...day.blocks, block] })) })
      },
      pause: () => set((state) => ({
        days: updateToday(state.days, (day) => ({
          ...day,
          blocks: day.blocks.map((block) => block.status === 'running'
            ? { ...block, status: 'paused', endsAt: null, remainingSeconds: Math.max(0, Math.ceil(((block.endsAt ?? Date.now()) - Date.now()) / 1000)) }
            : block),
        })),
      })),
      resume: () => set((state) => ({
        days: updateToday(state.days, (day) => ({
          ...day,
          blocks: day.blocks.map((block) => block.status === 'paused'
            ? { ...block, status: 'running', endsAt: Date.now() + block.remainingSeconds * 1000 }
            : block),
        })),
      })),
      finish: () => set((state) => ({
        days: updateToday(state.days, (day) => ({
          ...day,
          blocks: day.blocks.map((block) => {
            if (block.status !== 'running' && block.status !== 'paused') return block
            const now = Date.now()
            const remainingSeconds = block.status === 'running'
              ? Math.max(0, Math.ceil(((block.endsAt ?? now) - now) / 1000))
              : block.remainingSeconds
            return {
              ...block,
              status: 'completed',
              endsAt: null,
              remainingSeconds: 0,
              completedSeconds: block.durationSeconds - remainingSeconds,
              completedAt: now,
            }
          }),
        })),
      })),
      reset: () => set((state) => ({
        days: updateToday(state.days, (day) => ({
          ...day,
          blocks: day.blocks.map((block) => block.status === 'running' || block.status === 'paused'
            ? { ...block, status: 'cancelled', endsAt: null }
            : block),
        })),
      })),
    }),
    {
      name: 'presencia-app-focus-v1',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: migrateFocusState,
    },
  ),
)