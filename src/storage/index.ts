import { type AppState, type BlockRecord, type DayPlan, type Settings, defaultSettings, emptyState, type ActiveBlock } from '../state/types'

// El único módulo que lee y escribe localStorage. Si algún día se conectan dispositivos, solo cambia este archivo.
export const STORAGE_KEY = 'presencia:v1'
const VERSION = 1
const OLD_KEYS = ['presencia-app-focus-v1']

type Stored = { version: number; plan: DayPlan | null; active: ActiveBlock | null; records: BlockRecord[]; settings: Settings }

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const isKind = (value: unknown) => value === 'focus' || value === 'break' || value === 'breathe'

const isRecord = (value: unknown): value is BlockRecord =>
  isObject(value) && typeof value.id === 'string' && isKind(value.kind) && typeof value.title === 'string'
  && typeof value.focusMs === 'number' && typeof value.startedAt === 'string' && typeof value.endedAt === 'string'

const isPlan = (value: unknown): value is DayPlan =>
  isObject(value) && typeof value.date === 'string' && typeof value.intent === 'string' && Array.isArray(value.items)
  && value.items.every((item) => isObject(item) && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.plannedMin === 'number')

const isActive = (value: unknown): value is ActiveBlock =>
  isObject(value) && typeof value.id === 'string' && isKind(value.kind) && typeof value.totalMs === 'number'
  && (value.status === 'running' || value.status === 'paused')

const readSettings = (value: unknown): Settings => {
  if (!isObject(value)) return defaultSettings
  return {
    sound: value.sound === true,
    notifications: value.notifications === true,
    aiTrace: value.aiTrace === true,
  }
}

const storage = (): Storage | null => {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

// Lee lo guardado. Nunca lanza: si algo no cuadra, se queda con lo que sí sirve.
// El plan es de un solo día: si no es de hoy, se descarta.
export const loadState = (today: string): AppState => {
  const store = storage()
  if (!store) return emptyState
  try {
    for (const key of OLD_KEYS) store.removeItem(key)
    const raw = store.getItem(STORAGE_KEY)
    if (!raw) return emptyState
    const parsed: unknown = JSON.parse(raw)
    if (!isObject(parsed)) return emptyState
    const plan = isPlan(parsed.plan) && parsed.plan.date === today ? parsed.plan : null
    return {
      plan,
      active: isActive(parsed.active) ? parsed.active : null,
      records: Array.isArray(parsed.records) ? parsed.records.filter(isRecord) : [],
      settings: readSettings(parsed.settings),
    }
  } catch {
    return emptyState
  }
}

export const saveState = (state: AppState) => {
  const store = storage()
  if (!store) return
  const data: Stored = { version: VERSION, ...state }
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Sin espacio o sin permiso: la app sigue funcionando en memoria.
  }
}
