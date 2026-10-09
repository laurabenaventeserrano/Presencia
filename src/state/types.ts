// La forma de todo lo que guarda Presencia (docs/ARCHITECTURE.md, sección 2).

export type BlockKind = 'focus' | 'break' | 'breathe'

// Lo que ya ocurrió: alimenta la cuadrícula de Días.
export type BlockRecord = {
  id: string
  kind: BlockKind
  title: string
  plannedMin: number
  focusMs: number // tiempo realmente trabajado
  startedAt: string // ISO
  endedAt: string // ISO
  example?: true
}

export type PlanItemStatus = 'pending' | 'running' | 'later' | 'done'

// Un bloque del plan del día.
export type PlanItem = {
  id: string
  kind: BlockKind
  title: string
  plannedMin: number
  status: PlanItemStatus
  laterUntil?: string // ISO, si está aplazado
  remainingMs?: number // lo que le queda si se aplazó en marcha
  doneMin?: number // minutos reales si está hecho
  workedMs?: number // lo ya trabajado antes de aplazarlo
}

export type DayPlan = {
  date: string // 'YYYY-MM-DD' en la zona horaria local
  intent: string
  batch: number
  items: PlanItem[]
}

// El bloque que está en marcha o en pausa. Solo puede haber uno.
export type ActiveBlock = {
  id: string
  planItemId?: string
  kind: BlockKind
  title: string
  plannedMin: number
  extraMin: number // los «+5 min»
  totalMs: number // duración total de esta sesión, con los «+5 min»
  status: 'running' | 'paused'
  startedAt: string // ISO
  endsAt?: number // solo si corre
  remainingMs?: number // solo si está en pausa
}

export type Settings = {
  sound: boolean
  notifications: boolean
  aiTrace: boolean
}

export type AppState = {
  plan: DayPlan | null
  active: ActiveBlock | null
  records: BlockRecord[]
  settings: Settings
}

export const defaultSettings: Settings = { sound: false, notifications: false, aiTrace: false }

export const emptyState: AppState = { plan: null, active: null, records: [], settings: defaultSettings }

// Lo que una acción necesita del mundo exterior. Se pasa desde fuera para que las acciones sean puras.
export type Ctx = {
  now: number
  today: string
  id: () => string
}
