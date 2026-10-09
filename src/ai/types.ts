export type TaskKind = 'deep' | 'review' | 'admin'

export type BlockKind = 'focus' | 'break' | 'breathe'

// La IA solo necesita saber cómo se llama cada cosa.
export type PlanTask = { id: string; title: string }

export type PlanInput = {
  intention: string
  tasks: PlanTask[]
}

export type ProposedBlock = {
  kind: BlockKind
  minutes: number
  title?: string
  taskId?: string
}

export type PlanEvent =
  | { type: 'token'; text: string }
  | { type: 'blocks'; blocks: ProposedBlock[] }
  | { type: 'done' }

export interface AIProvider {
  plan(input: PlanInput, signal?: AbortSignal): AsyncGenerator<PlanEvent>
}
