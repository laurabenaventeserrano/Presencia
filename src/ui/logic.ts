import type { ProposedBlock } from '../ai/types'
import type { Task } from '../store'

export type OrbState = 'reposo' | 'escucha' | 'foco' | 'pausa' | 'hecho' | 'respirar'

export type FocusPhase = 'listo' | 'en-marcha' | 'en-pausa' | 'hecho'

export type BreathPhase = 'inspira' | 'espira'

export type Breath = { phase: BreathPhase; cycles: number }

export type ProposalRow = { key: string; title: string; minutes: number }

export const MIN_MINUTES = 5
export const MAX_MINUTES = 120
export const MINUTE_STEP = 5
export const BREATH_CYCLES = 9
export const FALLBACK_TITLE = 'Bloque de foco'

export const formatTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(safe / 60).toString().padStart(2, '0')
  const remainder = (safe % 60).toString().padStart(2, '0')
  return `${minutes}:${remainder}`
}

// Los minutos se ajustan de 5 en 5 y nunca salen de 5–120.
export const stepMinutes = (minutes: number, direction: 1 | -1) =>
  Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, minutes + direction * MINUTE_STEP))

// Solo los bloques de foco se proponen; las pausas de la IA no se muestran en esta fase.
export const proposalRows = (blocks: readonly ProposedBlock[], tasks: readonly Task[]): ProposalRow[] =>
  blocks
    .filter((block) => block.kind === 'focus')
    .map((block, index) => ({
      key: `${index}-${block.taskId ?? 'libre'}`,
      title: tasks.find((task) => task.id === block.taskId)?.title ?? FALLBACK_TITLE,
      minutes: block.minutes,
    }))

// Mientras escribes o la IA responde, el orbe escucha.
export const hoyOrb = (draft: string, streaming: boolean): OrbState =>
  streaming || draft.trim() ? 'escucha' : 'reposo'

export const focusOrb = (phase: FocusPhase): OrbState => {
  if (phase === 'en-marcha') return 'foco'
  if (phase === 'en-pausa') return 'pausa'
  if (phase === 'hecho') return 'hecho'
  return 'reposo'
}

// Cada vez que vuelves a Inspira se completa un ciclo; tras nueve se empieza de nuevo.
export const nextBreath = ({ phase, cycles }: Breath): Breath =>
  phase === 'inspira'
    ? { phase: 'espira', cycles }
    : { phase: 'inspira', cycles: (cycles % BREATH_CYCLES) + 1 }
