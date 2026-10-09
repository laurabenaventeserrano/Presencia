import type { DraftItem } from '../ai/types'
import type { AppState, Ctx } from '../state/types'

export type DraftRow = DraftItem & { id: string }

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
