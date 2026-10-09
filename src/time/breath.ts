// Respirar: cada 5 segundos se alterna «Coge aire» y «Suéltalo» (R2). Puro: depende solo del tiempo transcurrido.
export const BREATH_STEP_MS = 5_000
export const BREATH_MINUTES = [1, 3, 5]

export type BreathPhase = 'Coge aire' | 'Suéltalo'

export const breathPhase = (elapsedMs: number): BreathPhase =>
  Math.floor(Math.max(0, elapsedMs) / BREATH_STEP_MS) % 2 === 0 ? 'Coge aire' : 'Suéltalo'

// Dónde está el orbe dentro de su ciclo de 10 s, para que se expanda justo al coger aire.
export const breathCycleOffsetMs = (elapsedMs: number) => Math.max(0, elapsedMs) % (BREATH_STEP_MS * 2)
