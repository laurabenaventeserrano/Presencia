import type { Task } from '../store'
import type { PlanInput, ProposedBlock, TaskKind } from './types'

const BREAK_MINUTES = 5

const keywords: Record<Exclude<TaskKind, 'admin'>, string[]> = {
  deep: ['escrib', 'dise', 'program', 'investig'],
  review: ['revis', 'feedback', 'lee'],
}

const energyRank: Record<TaskKind, number> = { deep: 0, review: 1, admin: 2 }

const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export const kindOf = (title: string): TaskKind => {
  const text = normalize(title)
  if (keywords.deep.some((word) => text.includes(word))) return 'deep'
  if (keywords.review.some((word) => text.includes(word))) return 'review'
  return 'admin'
}

export const minutesFor: Record<TaskKind, number> = { deep: 50, review: 25, admin: 15 }

export const orderByEnergy = (tasks: readonly Task[]): Task[] =>
  [...tasks].sort((a, b) => energyRank[kindOf(a.title)] - energyRank[kindOf(b.title)])

export const buildBlocks = (input: PlanInput, doneTaskIds: ReadonlySet<string> = new Set()): ProposedBlock[] =>
  orderByEnergy(input.tasks.filter((task) => !doneTaskIds.has(task.id))).flatMap((task, index): ProposedBlock[] => {
    const focus: ProposedBlock = { kind: 'focus', minutes: minutesFor[kindOf(task.title)], taskId: task.id }
    return index === 0 ? [focus] : [{ kind: 'break', minutes: BREAK_MINUTES }, focus]
  })
