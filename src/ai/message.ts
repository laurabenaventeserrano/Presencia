import { extractIntents, isUnderstood, parseBudget } from './intent'
import type { PlanInput, ProposedBlock } from './types'

export const CLARIFICATION_MESSAGE = 'No te he entendido. ¿Qué quieres hacer hoy? Por ejemplo: diseñar la pantalla y responder emails.'

const plural = (count: number, singular: string, pluralForm: string) => `${count} ${count === 1 ? singular : pluralForm}`

export const buildMessage = (input: PlanInput, blocks: ProposedBlock[]): string => {
  const intents = extractIntents(input.intention)
  const understood = intents.filter((intent) => isUnderstood(intent, input.tasks))
  if (intents.length > 0 && understood.length === 0) return CLARIFICATION_MESSAGE

  const budget = parseBudget(input.intention)
  const opening = understood.length > 0 ? `He entendido: ${understood.join('; ')}.` : 'Entendido.'
  const budgetText = budget === null ? '' : ` Tienes ${plural(budget, 'minuto', 'minutos')}.`
  const focusBlocks = blocks.filter((block) => block.kind === 'focus')
  if (focusBlocks.length === 0) {
    const reason = budget === null
      ? 'No hay tareas pendientes, así que hoy no propongo bloques de foco.'
      : 'Con ese tiempo no cabe ningún bloque de foco.'
    return `${opening}${budgetText} ${reason}`
  }

  const focusMinutes = focusBlocks.reduce((total, block) => total + block.minutes, 0)
  const totalMinutes = blocks.reduce((total, block) => total + block.minutes, 0)
  const breaks = totalMinutes > focusMinutes ? `, ${totalMinutes} minutos en total con las pausas` : ''
  return `${opening}${budgetText} Te propongo ${plural(focusBlocks.length, 'bloque', 'bloques')} de foco: ${plural(focusMinutes, 'minuto', 'minutos')} de trabajo${breaks}.`
}
