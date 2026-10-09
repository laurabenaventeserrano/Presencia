import type { DraftItem } from '../ai/types'
import type { AppState, Ctx, DayPlan, PlanItem } from '../state/types'
import { remainingMs } from '../time'
import { startBlock, toRecord, UNTITLED } from './timer'
import { MAX_MINUTES, MIN_MINUTES } from '../ui/logic'

export type DraftRow = DraftItem & { id: string }

export const DEFAULT_NEW_MINUTES = 25

// Los minutos de un bloque nunca salen de 5–120.
export const clampMinutes = (minutes: number) =>
  Number.isFinite(minutes) ? Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.round(minutes))) : DEFAULT_NEW_MINUTES

const ensurePlan = (state: AppState, ctx: Ctx): DayPlan => state.plan ?? { date: ctx.today, intent: '', batch: 0, items: [] }

const mapItems = (state: AppState, update: (items: PlanItem[]) => PlanItem[]): AppState =>
  state.plan ? { ...state, plan: { ...state.plan, items: update(state.plan.items) } } : state

// La persona acepta la propuesta (con su primer gesto sobre ella): se convierte en el plan de hoy.
export const createPlan = (state: AppState, ctx: Ctx, input: { intent: string; batch: number; items: DraftRow[] }): AppState => ({
  ...state,
  plan: {
    date: ctx.today,
    intent: input.intent,
    batch: input.batch,
    items: input.items.map((item) => ({ id: item.id, kind: item.kind, title: item.title, plannedMin: item.plannedMin, status: 'pending' })),
  },
})

export const updateItem = (state: AppState, _ctx: Ctx, id: string, patch: { title?: string; plannedMin?: number }): AppState =>
  mapItems(state, (items) => items.map((item) => item.id === id
    ? { ...item, ...(patch.title !== undefined && { title: patch.title }), ...(patch.plannedMin !== undefined && { plannedMin: clampMinutes(patch.plannedMin) }) }
    : item))

// Quitar un bloque. No se quita el que está en marcha.
export const removeItem = (state: AppState, _ctx: Ctx, id: string): AppState =>
  state.active?.planItemId === id ? state : mapItems(state, (items) => items.filter((item) => item.id !== id))

// Añadir un bloque vacío al final, o devolver uno quitado a su sitio («Deshacer»).
export const addItem = (state: AppState, ctx: Ctx, restore?: { item: PlanItem; index: number }): AppState => {
  const plan = ensurePlan(state, ctx)
  const item: PlanItem = restore?.item ?? { id: ctx.id(), kind: 'focus', title: '', plannedMin: DEFAULT_NEW_MINUTES, status: 'pending' }
  const index = restore ? Math.min(restore.index, plan.items.length) : plan.items.length
  return { ...state, plan: { ...plan, items: [...plan.items.slice(0, index), item, ...plan.items.slice(index)] } }
}

// Empezar un bloque del plan: arranca En curso con su título y sus minutos (o con lo que le quedaba).
export const startItem = (state: AppState, ctx: Ctx, id: string): AppState => {
  const item = state.plan?.items.find((candidate) => candidate.id === id)
  if (!item || state.active || item.status === 'done') return state
  const started = startBlock(state, ctx, { kind: item.kind, title: item.title.trim() || UNTITLED, minutes: item.plannedMin, planItemId: item.id, resumeMs: item.remainingMs })
  return mapItems(started, (items) => items.map((candidate) => candidate.id === id ? { ...candidate, status: 'running', laterUntil: undefined } : candidate))
}

// «Más tarde»: el bloque queda aplazado hasta una hora. Si estaba en marcha, conserva lo que le quedaba
// y lo trabajado se guarda (cuenta para el día).
export const postponeItem = (state: AppState, ctx: Ctx, id: string, minutes: number): AppState => {
  const laterUntil = new Date(ctx.now + minutes * 60_000).toISOString()
  const { active } = state
  if (active && active.planItemId === id) {
    const record = toRecord(active, ctx)
    const left = remainingMs(active, ctx.now)
    const next = mapItems(state, (items) => items.map((item) => item.id === id
      ? { ...item, status: 'later', laterUntil, remainingMs: left, workedMs: (item.workedMs ?? 0) + record.focusMs }
      : item))
    return { ...next, active: null, records: record.focusMs > 0 ? [...next.records, record] : next.records }
  }
  return mapItems(state, (items) => items.map((item) => item.id === id && item.status !== 'done' && item.status !== 'running'
    ? { ...item, status: 'later', laterUntil }
    : item))
}

// «Más tarde» desde En curso. Un bloque del temporizador (sin plan) vuelve a Tu día como bloque aplazado.
export const postponeActive = (state: AppState, ctx: Ctx, minutes: number): AppState => {
  const { active } = state
  if (!active) return state
  if (active.planItemId && state.plan?.items.some((item) => item.id === active.planItemId)) return postponeItem(state, ctx, active.planItemId, minutes)
  const item: PlanItem = { id: active.planItemId ?? active.id, kind: active.kind, title: active.title, plannedMin: active.plannedMin, status: 'running' }
  const withItem = addItem(state, ctx, { item, index: Number.MAX_SAFE_INTEGER })
  return postponeItem({ ...withItem, active: { ...active, planItemId: item.id } }, ctx, item.id, minutes)
}

// El plan es de un solo día: al cambiar de día, el de ayer desaparece (su rastro queda en los registros).
export const rollDay = (state: AppState, ctx: Ctx): AppState =>
  state.plan && state.plan.date !== ctx.today ? { ...state, plan: null } : state
