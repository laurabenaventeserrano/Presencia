import type { ActiveBlock } from '../state/types'
import { formatTime } from '../ui/logic'

// La fecha local 'YYYY-MM-DD' de un instante. Un bloque cuenta para el día en que empezó.
export const localDate = (ms: number) => {
  const date = new Date(ms)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// El temporizador nunca cuenta segundos: el tiempo restante se calcula a partir de endsAt.
export const remainingMs = (active: ActiveBlock, now: number) => {
  const left = active.status === 'running' ? (active.endsAt ?? now) - now : active.remainingMs ?? 0
  return Math.min(active.totalMs, Math.max(0, left))
}

export const isEnded = (active: ActiveBlock, now: number) => remainingMs(active, now) === 0

// Lo trabajado de verdad: lo que se planeó para esta sesión menos lo que queda.
export const workedMs = (active: ActiveBlock, now: number) => Math.max(0, active.totalMs - remainingMs(active, now))

export const remainingSeconds = (active: ActiveBlock, now: number) => Math.ceil(remainingMs(active, now) / 1000)

export const clock = (active: ActiveBlock, now: number) => formatTime(remainingSeconds(active, now))

// Título de la pestaña: el tiempo solo mientras corre.
export const tabTitle = (active: ActiveBlock | null, now: number) =>
  active && active.status === 'running' && !isEnded(active, now) ? `${clock(active, now)} · Presencia` : 'Presencia'

export const minutesLabel = (minutes: number) => `${minutes} min`

export const timeOfDay = (iso: string) => {
  const date = new Date(iso)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
