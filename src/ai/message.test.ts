import { describe, expect, it } from 'vitest'
import { buildMessage, CLARIFICATION_MESSAGE } from './message'
import { buildBlocks } from './rules'
import type { PlanInput } from './types'

const inputFor = (intention: string): PlanInput => ({
  intention,
  tasks: [
    { id: 'design', title: 'Diseñar la pantalla de inicio' },
    { id: 'email', title: 'Responder emails pendientes' },
  ],
  memory: [],
})

const messageFor = (intention: string) => {
  const input = inputFor(intention)
  return buildMessage(input, buildBlocks(input))
}

describe('buildMessage', () => {
  it('pide aclaración si no entiende nada', () => {
    expect(messageFor('fjnewj')).toBe(CLARIFICATION_MESSAGE)
  })

  it('lista lo que ha entendido y menciona el presupuesto', () => {
    expect(messageFor('Quiero diseñar la pantalla y responder emails, tengo una hora')).toBe(
      'He entendido: diseñar la pantalla; responder emails. Tienes 60 minutos. Te propongo 1 bloque de foco: 50 minutos de trabajo.',
    )
  })

  it('ignora las intenciones que no entiende si hay otras que sí', () => {
    expect(messageFor('responder emails y fjnewj')).toBe(
      'He entendido: responder emails. Te propongo 1 bloque de foco: 15 minutos de trabajo.',
    )
  })

  it('avisa si con el presupuesto no cabe ningún bloque', () => {
    expect(messageFor('diseñar la pantalla, tengo 10 minutos')).toBe(
      'He entendido: diseñar la pantalla. Tienes 10 minutos. Con ese tiempo no cabe ningún bloque de foco.',
    )
  })
})
