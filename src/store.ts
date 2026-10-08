import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { kindOf, minutesFor } from './ai/rules'
import type { BlockKind, TaskKind } from './ai/types'
import { sampleTaskTitles } from './seed/tasks'

export type Task = {
  id: string
  title: string
  estimatedMin: number
  kind: TaskKind
  done: boolean
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
  addTask: (title: string, estimatedMin?: number) => void
  setTaskMinutes: (taskId: string, minutes: number) => void
  toggleTaskDone: (taskId: string) => void
  deleteTask: (taskId: string) => void
  loadSampleTasks: () => void
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

const currentDay = (): Day => ({
  date: dayKey(),
  taskIds: [],
  blocks: [],
})

// Una tarea nueva toma su tipo del título y, si no se dicen los minutos, los de su tipo.
const createTask = (title: string, estimatedMin?: number): Task => {
  const kind = kindOf(title)
  return { id: crypto.randomUUID(), title, estimatedMin: estimatedMin ?? minutesFor[kind], kind, done: false, createdAt: Date.now() }
}

export const getActiveBlock = (blocks: Block[]) => [...blocks].reverse().find(
  (block) => block.status === 'running' || block.status === 'paused',
)

type BlockV1 = Omit<Block, 'title' | 'kind' | 'plannedMin'>
type TaskV2 = Omit<Task, 'estimatedMin' | 'kind' | 'done'>

type PersistedFocusState = Partial<Pick<FocusState, 'tasks' | 'days' | 'selectedTaskId' | 'durationMinutes'>>

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

// v1 → v2: los bloques guardan su título, su tipo y sus minutos para no depender de una tarea.
const migrateBlock = (block: BlockV1, tasks: readonly Task[]): Block => ({
  ...block,
  title: tasks.find((task) => task.id === block.taskId)?.title ?? '',
  kind: 'focus',
  plannedMin: Math.round(block.durationSeconds / 60),
})

// v2 → v3: las tareas guardan sus minutos, su tipo y si están hechas.
const migrateTask = (task: TaskV2): Task => {
  const kind = kindOf(task.title)
  return { ...task, estimatedMin: minutesFor[kind], kind, done: false }
}

const migrateBlocks = (state: PersistedFocusState): PersistedFocusState => {
  const tasks = state.tasks ?? []
  const oldDays = (state.days ?? {}) as Record<string, Omit<Day, 'blocks'> & { blocks: BlockV1[] }>
  const days = Object.fromEntries(Object.entries(oldDays).map(([date, day]) => [
    date,
    { ...day, blocks: day.blocks.map((block) => migrateBlock(block, tasks)) },
  ]))
  return { ...state, days }
}

export const migrateFocusState = (persisted: unknown, version: number): PersistedFocusState => {
  if (!isRecord(persisted)) return {}
  let state = persisted as PersistedFocusState
  if (version < 2) state = migrateBlocks(state)
  if (version < 3) state = { ...state, tasks: ((state.tasks ?? []) as TaskV2[]).map(migrateTask) }
  return state
}

const getToday = (days: Record<string, Day>) => days[dayKey()] ?? currentDay()

const updateToday = (days: Record<string, Day>, update: (day: Day) => Day) => {
  const today = getToday(days)
  return { ...days, [today.date]: update(today) }
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      tasks: [],
      days: { [dayKey()]: currentDay() },
      selectedTaskId: '',
      durationMinutes: 25,
      addTask: (title, estimatedMin) => {
        const trimmedTitle = title.trim()
        if (!trimmedTitle) return
        const task = createTask(trimmedTitle, estimatedMin)
        set((state) => ({
          tasks: [...state.tasks, task],
          days: updateToday(state.days, (day) => ({ ...day, taskIds: [...day.taskIds, task.id] })),
          selectedTaskId: task.id,
        }))
      },
      setTaskMinutes: (taskId, minutes) => set((state) => ({
        tasks: state.tasks.map((task) => task.id === taskId ? { ...task, estimatedMin: minutes } : task),
      })),
      toggleTaskDone: (taskId) => set((state) => ({
        tasks: state.tasks.map((task) => task.id === taskId ? { ...task, done: !task.done } : task),
      })),
      // Los bloques de esa tarea se conservan: guardan su propio título.
      deleteTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== taskId),
        days: Object.fromEntries(Object.entries(state.days).map(([date, day]) => [
          date,
          { ...day, taskIds: day.taskIds.filter((id) => id !== taskId) },
        ])),
        selectedTaskId: state.selectedTaskId === taskId ? '' : state.selectedTaskId,
      })),
      loadSampleTasks: () => {
        if (get().tasks.length > 0) return
        const tasks = sampleTaskTitles.map((title) => createTask(title))
        set((state) => ({
          tasks,
          days: updateToday(state.days, (day) => ({ ...day, taskIds: tasks.map((task) => task.id) })),
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
      version: 3,
      migrate: migrateFocusState,
    },
  ),
)