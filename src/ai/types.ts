import type { Block, Memory, Task } from '../store'

export type TaskKind = 'deep' | 'review' | 'admin'

export type BlockKind = 'focus' | 'break' | 'breathe' | 'meditate'

// La IA solo necesita saber cómo se llama cada tarea.
export type PlanTask = Pick<Task, 'id' | 'title'>

export type PlanInput = {
  intention: string
  tasks: PlanTask[]
  memory: Memory[]
}

export type ProposedBlock = {
  kind: BlockKind
  minutes: number
  title?: string
  taskId?: Block['taskId']
}

export type PlanEvent =
  | { type: 'token'; text: string }
  | { type: 'blocks'; blocks: ProposedBlock[] }
  | { type: 'done' }

export interface AIProvider {
  plan(input: PlanInput, signal?: AbortSignal): AsyncGenerator<PlanEvent>
}
