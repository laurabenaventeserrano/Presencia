import { describe, expect, it } from 'vitest'
import { createMockProvider } from './mock-provider'
import type { PlanEvent, PlanInput } from './types'

const instantSleep = () => Promise.resolve()

const input: PlanInput = {
  intention: 'Cerrar el diseño de la pantalla principal',
  tasks: [
    { id: 'a', title: 'Responder emails' },
    { id: 'b', title: 'Diseñar la pantalla' },
    { id: 'c', title: 'Revisar el feedback' },
  ],
}

const collect = async (signal?: AbortSignal) => {
  const events: PlanEvent[] = []
  for await (const event of createMockProvider({ sleep: instantSleep }).plan(input, signal)) events.push(event)
  return events
}

const tokenText = (events: PlanEvent[]) => events.map((event) => event.type === 'token' ? event.text : '').join('')

describe('createMockProvider', () => {
  it("emite tokens, luego un único 'blocks' y luego 'done', en ese orden", async () => {
    const types = (await collect()).map((event) => event.type)
    const blocksIndex = types.indexOf('blocks')
    expect(blocksIndex).toBeGreaterThan(0)
    expect(types.slice(0, blocksIndex).every((type) => type === 'token')).toBe(true)
    expect(types.slice(blocksIndex)).toEqual(['blocks', 'done'])
  })

  it("si se cancela a mitad, no emite 'blocks' ni 'done'", async () => {
    const controller = new AbortController()
    const events: PlanEvent[] = []
    for await (const event of createMockProvider({ sleep: instantSleep }).plan(input, controller.signal)) {
      events.push(event)
      if (events.length === 2) controller.abort()
    }
    expect(events).toHaveLength(2)
    expect(events.every((event) => event.type === 'token')).toBe(true)
  })

  it('con la misma entrada devuelve el mismo texto y los mismos bloques', async () => {
    const [first, second] = await Promise.all([collect(), collect()])
    expect(tokenText(first)).toBe(tokenText(second))
    expect(first.find((event) => event.type === 'blocks')).toEqual(second.find((event) => event.type === 'blocks'))
  })
})
