import type { Task } from '../store'
import { extractIntents, isUnderstood, kindKeywords, matchTasks, normalize, parseBudget } from './intent'
import type { PlanInput, ProposedBlock, TaskKind } from './types'

const BREAK_MINUTES = 5

const energyRank: Record<TaskKind, number> = { deep: 0, review: 1, admin: 2 }

export const kindOf = (title: string): TaskKind => {
  const text = normalize(title)
  if (kindKeywords.deep.some((word) => text.includes(word))) return 'deep'
  if (kindKeywords.review.some((word) => text.includes(word))) return 'review'
  return 'admin'
}

export const minutesFor: Record<TaskKind, number> = { deep: 50, review: 25, admin: 15 }

export const orderByEnergy = (tasks: readonly Task[]): Task[] =>
  [...tasks].sort((a, b) => energyRank[kindOf(a.title)] - energyRank[kindOf(b.title)])

const tasksForPlan = (intention: string, pending: Task[]): Task[] => {
  const intents = extractIntents(intention)
  if (intents.length === 0) return pending
  return matchTasks(intents.filter((intent) => isUnderstood(intent, pending)), pending)
}

// Recorre los bloques en orden y deja fuera los que ya no caben en el presupuesto.
const fitBudget = (blocks: ProposedBlock[], budget: number | null): ProposedBlock[] => {
  if (budget === null) return blocks
  let used = 0
  return blocks.filter((block) => {
    if (used + block.minutes > budget) return false
    used += block.minutes
    return true
  })
}

const withBreaks = (focusBlocks: ProposedBlock[]): ProposedBlock[] =>
  focusBlocks.flatMap((focus, index) => index === 0 ? [focus] : [{ kind: 'break', minutes: BREAK_MINUTES }, focus])

export const buildBlocks = (input: PlanInput, doneTaskIds: ReadonlySet<string> = new Set()): ProposedBlock[] => {
  const pending = input.tasks.filter((task) => !doneTaskIds.has(task.id))
  const focusBlocks = orderByEnergy(tasksForPlan(input.intention, pending)).map((task): ProposedBlock => (
    { kind: 'focus', minutes: minutesFor[kindOf(task.title)], taskId: task.id }
  ))
  return withBreaks(fitBudget(focusBlocks, parseBudget(input.intention)))
}
