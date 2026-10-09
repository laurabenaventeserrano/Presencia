import type { DraftItem, PlanInput, TaskKind } from './types'
import { extractIntents, kindKeywords, normalize, parseBudget } from './intent'
import { createRng, hashString, type Rng, shuffle } from './rng'

// Reglas de la IA simulada (SPEC.md, sección 3). Son puras: la variedad sale de una semilla.

export const BREATHE_MINUTES = 3
const LONG_LIST = 3 // a partir de tres bloques de foco se intercala un respiro

const energyRank: Record<TaskKind, number> = { deep: 0, review: 1, admin: 2 }

export const kindOf = (title: string): TaskKind => {
  const text = normalize(title)
  if (kindKeywords.deep.some((word) => text.includes(word))) return 'deep'
  if (kindKeywords.review.some((word) => text.includes(word))) return 'review'
  return 'admin'
}

// Profundo 50, revisión 25, gestiones 15. Las tandas siguientes rotan por variantes cercanas.
export const minutesFor: Record<TaskKind, number> = { deep: 50, review: 25, admin: 15 }
const minuteVariants: Record<TaskKind, number[]> = { deep: [50, 45, 60], review: [25, 30, 20], admin: [15, 20, 10] }

const capitalize = (text: string) => text.charAt(0).toLocaleUpperCase('es') + text.slice(1)

// Repertorio para «Sugiéreme un día».
const SUGGESTIONS: { title: string; kind: TaskKind }[] = [
  { title: 'Escribir sin interrupciones', kind: 'deep' },
  { title: 'Diseñar una idea nueva', kind: 'deep' },
  { title: 'Estudiar algo pendiente', kind: 'deep' },
  { title: 'Preparar la semana', kind: 'deep' },
  { title: 'Revisar lo que tengo abierto', kind: 'review' },
  { title: 'Leer con calma', kind: 'review' },
  { title: 'Planificar el mes', kind: 'review' },
  { title: 'Ordenar el correo', kind: 'admin' },
  { title: 'Hacer las llamadas pendientes', kind: 'admin' },
  { title: 'Pagar y archivar facturas', kind: 'admin' },
]

export const seedFor = (input: PlanInput) => hashString(`${normalize(input.intent.trim())}|${input.date}|${input.batch}`)

type Focus = { title: string; kind: TaskKind }

const focusFromIntent = (intent: string): Focus[] => {
  const parts = extractIntents(intent)
  // Siempre hay plan: si no se entiende nada, el texto entero es el título de un único bloque.
  const titles = parts.length > 0 ? parts : [intent.trim()]
  return titles.map((title) => ({ title: capitalize(title), kind: kindOf(title) }))
}

const suggestedFocus = (rng: Rng): Focus[] => shuffle(rng, SUGGESTIONS).slice(0, 3 + Math.floor(rng() * 2))

// Lo más exigente antes. En tandas siguientes, las cosas del mismo tipo cambian de orden.
const orderByEnergy = (items: Focus[], rng: Rng, batch: number): Focus[] => {
  const groups = [0, 1, 2].map((rank) => items.filter((item) => energyRank[item.kind] === rank))
  return groups.flatMap((group) => (batch === 0 ? group : shuffle(rng, group)))
}

// Cada tanda rota los minutos de todos los bloques: la lista cambia entera con «Otra propuesta».
const toDraft = (items: Focus[], batch: number): DraftItem[] =>
  items.map((item) => {
    const variants = minuteVariants[item.kind]
    return { kind: 'focus', title: item.title, plannedMin: variants[batch % variants.length] }
  })

// Recorta por el tiempo disponible, pero nunca deja el plan vacío.
const fitBudget = (items: DraftItem[], budget: number | null): DraftItem[] => {
  if (budget === null) return items
  let used = 0
  const fitted = items.filter((item) => {
    if (used + item.plannedMin > budget) return false
    used += item.plannedMin
    return true
  })
  return fitted.length > 0 ? fitted : [{ ...items[0], plannedMin: Math.max(5, Math.min(items[0].plannedMin, budget)) }]
}

// En una lista larga, un «Respirar» de 3 minutos entre dos bloques de foco (nunca al principio ni al final).
const withBreathe = (items: DraftItem[], rng: Rng, batch: number): DraftItem[] => {
  if (items.length < LONG_LIST) return items
  const middle = Math.floor(items.length / 2)
  const at = batch === 0 ? middle : 1 + Math.floor(rng() * (items.length - 1))
  return [...items.slice(0, at), { kind: 'breathe', title: 'Respirar', plannedMin: BREATHE_MINUTES }, ...items.slice(at)]
}

export const buildPlan = (input: PlanInput): DraftItem[] => {
  const rng = createRng(seedFor(input))
  const intent = input.intent.trim()
  const focus = intent ? focusFromIntent(intent) : suggestedFocus(rng)
  const ordered = orderByEnergy(focus, rng, input.batch)
  const fitted = fitBudget(toDraft(ordered, input.batch), intent ? parseBudget(intent) : null)
  return withBreathe(fitted, rng, input.batch)
}

export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

export const totalMinutes = (items: readonly { plannedMin: number }[]) => items.reduce((total, item) => total + item.plannedMin, 0)

// «Te propongo 4 bloques, 2 h 15 min en total.»
export const summarize = (items: readonly DraftItem[]) =>
  `Te propongo ${items.length} ${items.length === 1 ? 'bloque' : 'bloques'}, ${formatDuration(totalMinutes(items))} en total.`

