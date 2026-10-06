import type { PlanInput, ProposedBlock } from './types'

const plural = (count: number, singular: string, pluralForm: string) => `${count} ${count === 1 ? singular : pluralForm}`

export const buildMessage = (input: PlanInput, blocks: ProposedBlock[]): string => {
  const intention = input.intention.trim()
  const opening = intention ? `Entendido: «${intention}».` : 'Entendido.'
  const focusBlocks = blocks.filter((block) => block.kind === 'focus')
  if (focusBlocks.length === 0) return `${opening} No hay tareas pendientes, así que hoy no propongo bloques de foco.`

  const focusMinutes = focusBlocks.reduce((total, block) => total + block.minutes, 0)
  const totalMinutes = blocks.reduce((total, block) => total + block.minutes, 0)
  const breaks = totalMinutes > focusMinutes ? `, ${totalMinutes} minutos en total con las pausas` : ''
  return `${opening} Te propongo ${plural(focusBlocks.length, 'bloque', 'bloques')} de foco: ${plural(focusMinutes, 'minuto', 'minutos')} de trabajo${breaks}.`
}
