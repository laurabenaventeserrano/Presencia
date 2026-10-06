import type { Block, Memory, Task } from '../store'

export type TaskKind = 'deep' | 'review' | 'admin'

export type BlockKind = 'focus' | 'break' | 'breathe' | 'meditate'

export type PlanInput = {
  intention: string
  tasks: Task[]
  memory: Memory[]
}

export type ProposedBlock = {
  kind: BlockKind
  minutes: number
  taskId?: Block['taskId']
}

export type PlanEvent =
  | { type: 'token'; text: string }
  | { type: 'blocks'; blocks: ProposedBlock[] }
  | { type: 'done' }

export interface AIProvider {
  plan(input: PlanInput, signal?: AbortSignal): AsyncGenerator<PlanEvent>
}
