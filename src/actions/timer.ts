import type { ActiveBlock, AppState, BlockKind, BlockRecord, Ctx } from '../state/types'
import { remainingMs, workedMs } from '../time'

// Acciones del temporizador. Son funciones puras: reciben el estado y devuelven el siguiente.

export const UNTITLED = 'Sin título'
export const BREAK_MINUTES = 5
const EXTEND_MS = 5 * 60_000

type StartInput = { kind: BlockKind; title: string; minutes: number; planItemId?: string; resumeMs?: number }

// Solo puede haber un bloque activo: si ya hay uno, no hace nada.
export const startBlock = (state: AppState, input: StartInput, ctx: Ctx): AppState => {
  if (state.active) return state
  const totalMs = input.resumeMs ?? input.minutes * 60_000
  const active: ActiveBlock = {
    id: ctx.id(),
    planItemId: input.planItemId,
    kind: input.kind,
    title: input.title,
    plannedMin: input.minutes,
    extraMin: 0,
    totalMs,
    status: 'running',
    startedAt: new Date(ctx.now).toISOString(),
    endsAt: ctx.now + totalMs,
  }
  return { ...state, active }
}

export const startTimer = (state: AppState, input: { title: string; minutes: number }, ctx: Ctx) =>
  startBlock(state, { kind: 'focus', title: input.title.trim() || UNTITLED, minutes: input.minutes }, ctx)

export const startBreathing = (state: AppState, input: { minutes: number }, ctx: Ctx) =>
  startBlock(state, { kind: 'breathe', title: 'Respirar', minutes: input.minutes }, ctx)

export const startBreak = (state: AppState, ctx: Ctx) =>
  startBlock(state, { kind: 'break', title: 'Descanso', minutes: BREAK_MINUTES }, ctx)

// Al pausar se congela lo que queda; endsAt desaparece.
export const pause = (state: AppState, ctx: Ctx): AppState => {
  const { active } = state
  if (!active || active.status !== 'running') return state
  return { ...state, active: { ...active, status: 'paused', remainingMs: remainingMs(active, ctx.now), endsAt: undefined } }
}

export const resume = (state: AppState, ctx: Ctx): AppState => {
  const { active } = state
  if (!active || active.status !== 'paused') return state
  return { ...state, active: { ...active, status: 'running', endsAt: ctx.now + (active.remainingMs ?? 0), remainingMs: undefined } }
}

// «+5 min»: suma cinco minutos a lo que queda (si ya llegó a cero, desde ahora).
export const extend = (state: AppState, ctx: Ctx): AppState => {
  const { active } = state
  if (!active) return state
  const extended = { ...active, extraMin: active.extraMin + 5, totalMs: active.totalMs + EXTEND_MS }
  return {
    ...state,
    active: active.status === 'running'
      ? { ...extended, endsAt: Math.max(active.endsAt ?? ctx.now, ctx.now) + EXTEND_MS }
      : { ...extended, remainingMs: (active.remainingMs ?? 0) + EXTEND_MS },
  }
}

export const toRecord = (active: ActiveBlock, ctx: Ctx): BlockRecord => ({
  id: active.id,
  kind: active.kind,
  title: active.title,
  plannedMin: active.plannedMin,
  focusMs: workedMs(active, ctx.now),
  startedAt: active.startedAt,
  endedAt: new Date(ctx.now).toISOString(),
})

// Terminar convierte el bloque en un registro con lo trabajado de verdad.
// Si venía del plan, queda «Hecho» con los minutos reales; el siguiente no arranca solo.
export const finish = (state: AppState, ctx: Ctx): AppState => {
  const { active } = state
  if (!active) return state
  const record = toRecord(active, ctx)
  const plan = state.plan && active.planItemId
    ? {
      ...state.plan,
      items: state.plan.items.map((item) => item.id === active.planItemId
        ? { ...item, status: 'done' as const, doneMin: Math.round(record.focusMs / 60_000), remainingMs: undefined, laterUntil: undefined }
        : item),
    }
    : state.plan
  return { ...state, active: null, plan, records: [...state.records, record] }
}
