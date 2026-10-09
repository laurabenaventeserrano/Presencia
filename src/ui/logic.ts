export type OrbState = 'reposo' | 'escucha' | 'foco' | 'pausa' | 'hecho' | 'respirar'

export const MIN_MINUTES = 5
export const MAX_MINUTES = 120
export const MINUTE_STEP = 5

export const formatTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(safe / 60).toString().padStart(2, '0')
  const remainder = (safe % 60).toString().padStart(2, '0')
  return `${minutes}:${remainder}`
}

// Los minutos se ajustan de 5 en 5 y nunca salen de 5–120.
export const stepMinutes = (minutes: number, direction: 1 | -1) =>
  Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, minutes + direction * MINUTE_STEP))
