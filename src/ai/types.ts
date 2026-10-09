import type { BlockKind } from '../state/types'

export type TaskKind = 'deep' | 'review' | 'admin'

// Un bloque propuesto por la IA. Es un borrador: no entra en el día hasta que la persona lo toca.
export type DraftItem = { kind: BlockKind; title: string; plannedMin: number }

export type ProposePlanArgs = { summary: string; items: DraftItem[] }

export type PlanInput = {
  intent: string // lo que escribió la persona; vacío para «Sugiéreme un día»
  date: string // 'YYYY-MM-DD'
  batch: number // «Otra propuesta» sube la tanda
}

// La IA no toca la app: escribe un texto palabra a palabra y llama a una herramienta.
export type PlanEvent =
  | { type: 'token'; text: string }
  | { type: 'tool_call'; name: 'propose_plan'; args: ProposePlanArgs }
  | { type: 'done' }

export interface AIProvider {
  plan(input: PlanInput, signal?: AbortSignal): AsyncGenerator<PlanEvent>
}
