import type { TaskKind } from './types'

export const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export const kindKeywords: Record<Exclude<TaskKind, 'admin'>, string[]> = {
  deep: ['escrib', 'dise', 'program', 'investig', 'redact', 'prepar', 'estudi', 'crear'],
  review: ['revis', 'feedback', 'lee', 'corregi', 'analiz', 'planific'],
}

const NUMBER_WORDS: Record<string, number> = { una: 1, un: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8 }
const AMOUNT = `(\\d+|${Object.keys(NUMBER_WORDS).join('|')})`
const BUDGET_PATTERN = new RegExp(`\\b(media hora|hora y media|${AMOUNT}\\s*(horas?|minutos?|min)(\\s+y\\s+media)?)\\b`, 'i')
const STARTER_PATTERN = /^(hoy\s+)?(quiero|necesito|tengo que|tengo|voy a|debo)\s+/i

// Restos que quedan al quitar el tiempo disponible («tengo tres horas» → «tengo»).
const FILLER = /^(hoy|tengo|necesito|quiero|y|solo|unas?)$/

const amountOf = (word: string) => NUMBER_WORDS[word] ?? Number(word)

// Lee el tiempo disponible si lo dices: «tengo tres horas», «90 minutos», «hora y media».
export const parseBudget = (intent: string): number | null => {
  const match = normalize(intent).match(BUDGET_PATTERN)
  if (!match) return null
  if (match[1] === 'media hora') return 30
  if (match[1] === 'hora y media') return 90
  const amount = amountOf(match[2])
  const half = match[4] ? 30 : 0
  return match[3].startsWith('hora') ? amount * 60 + half : amount
}

const stripStarters = (fragment: string) => {
  let text = fragment.trim().replace(/[.!?¡¿]+/g, '').trim()
  while (STARTER_PATTERN.test(text)) text = text.replace(STARTER_PATTERN, '').trim()
  return text
}

// Separa las cosas que has dicho, tal como se escribieron (con tildes) para poder mostrarlas.
export const extractIntents = (intent: string): string[] =>
  intent
    .replace(new RegExp(BUDGET_PATTERN.source, 'gi'), ' ')
    .split(/\s+y\s+|[,;\n]/i)
    .map(stripStarters)
    .filter((fragment) => fragment.length > 0 && !FILLER.test(normalize(fragment)))
