import type { AppState, Ctx } from '../state/types'
import { emptyState } from '../state/types'
import { localDate } from '../time'

// Un contexto de prueba con un reloj que se puede mover y ids previsibles.
export const testCtx = (start = new Date('2026-10-09T10:00:00').getTime()) => {
  let now = start
  let n = 0
  const ctx = (): Ctx => ({ now, today: localDate(now), id: () => `id-${++n}` })
  return { ctx, advance: (ms: number) => { now += ms }, now: () => now }
}

export const state = (patch: Partial<AppState> = {}): AppState => ({ ...emptyState, ...patch })
