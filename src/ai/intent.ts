import type { PlanTask, TaskKind } from './types'

export const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export const kindKeywords: Record<Exclude<TaskKind, 'admin'>, string[]> = {
  deep: ['escrib', 'dise', 'program', 'investig'],
  review: ['revis', 'feedback', 'lee'],
}

const adminKeywords = ['respond', 'email', 'correo', 'llam', 'reunion', 'paga', 'pago']
const knownKeywords = [...kindKeywords.deep, ...kindKeywords.review, ...adminKeywords]

const stopwords = new Set([
  'para', 'pero', 'sobre', 'entre', 'desde', 'hasta', 'antes', 'despues', 'como', 'cuando', 'donde', 'porque',
  'unos', 'unas', 'esta', 'este', 'esto', 'estas', 'estos', 'todo', 'toda', 'todos', 'todas', 'otro', 'otra',
  'algo', 'hacer', 'tengo', 'quiero', 'necesito', 'solo', 'tambien', 'mucho', 'poco', 'luego',
])

const BUDGET_PATTERN = /\b(media hora|una hora|(\d+)\s*(horas?|minutos?|min))\b/i
const STARTER_PATTERN = /^(quiero|necesito|tengo que|voy a)\s+/i

export const parseBudget = (intention: string): number | null => {
  const match = normalize(intention).match(BUDGET_PATTERN)
  if (!match) return null
  if (match[1] === 'media hora') return 30
  if (match[1] === 'una hora') return 60
  const amount = Number(match[2])
  return match[3].startsWith('hora') ? amount * 60 : amount
}

const stripStarters = (fragment: string) => {
  let text = fragment.trim().replace(/[.!?¡¿]+/g, '').trim()
  while (STARTER_PATTERN.test(text)) text = text.replace(STARTER_PATTERN, '').trim()
  return text
}

// Devuelve los trozos tal como se escribieron (con tildes) para poder mostrarlos.
export const extractIntents = (intention: string): string[] =>
  intention
    .replace(new RegExp(BUDGET_PATTERN.source, 'gi'), ' ')
    .split(/\s+y\s+|[,;]/i)
    .map(stripStarters)
    .filter((fragment) => fragment.length > 0)

const significantWords = (text: string) =>
  normalize(text).split(/[^a-z0-9]+/).filter((word) => word.length > 3 && !stopwords.has(word))

const bestMatch = (intent: string, tasks: readonly PlanTask[]): PlanTask | undefined => {
  const words = new Set(significantWords(intent))
  let best: PlanTask | undefined
  let bestScore = 0
  for (const task of tasks) {
    const score = significantWords(task.title).filter((word) => words.has(word)).length
    if (score > bestScore) {
      best = task
      bestScore = score
    }
  }
  return best
}

export const matchTasks = (intents: readonly string[], tasks: readonly PlanTask[]): PlanTask[] =>
  intents.reduce<PlanTask[]>((matched, intent, index) => {
    const task = bestMatch(intent, tasks) ?? { id: `intent-${index}`, title: intent }
    return matched.some((item) => item.id === task.id) ? matched : [...matched, task]
  }, [])

export const isUnderstood = (intent: string, tasks: readonly PlanTask[]): boolean => {
  if (bestMatch(intent, tasks)) return true
  const text = normalize(intent)
  return knownKeywords.some((keyword) => text.includes(keyword))
}
