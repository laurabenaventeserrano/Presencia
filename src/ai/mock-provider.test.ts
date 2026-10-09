import { describe, expect, it } from 'vitest'
import { createMockProvider } from './mock-provider'
import { buildPlan, summarize } from './rules'
import type { PlanEvent, PlanInput } from './types'

const instantSleep = () => Promise.resolve()
const input: PlanInput = { intent: 'escribir la propuesta, revisar correos y llamar a Marta', date: '2026-10-09', batch: 0 }

const collect = async (signal?: AbortSignal) => {
  const events: PlanEvent[] = []
  for await (const event of createMockProvider({ sleep: instantSleep }).plan(input, signal)) events.push(event)
  return events
}

describe('createMockProvider', () => {
  it('X1 escribe el resumen palabra a palabra y después llama a propose_plan con los bloques', async () => {
    const events = await collect()
    const types = events.map((event) => event.type)
    const call = types.indexOf('tool_call')
    expect(types.slice(0, call).every((type) => type === 'token')).toBe(true)
    expect(types.slice(call)).toEqual(['tool_call', 'done'])
    const items = buildPlan(input)
    expect(events[call]).toEqual({ type: 'tool_call', name: 'propose_plan', args: { summary: summarize(items), items } })
    expect(events.map((event) => (event.type === 'token' ? event.text : '')).join('')).toBe(summarize(items))
  })

  it('si se cancela a mitad, no llama a la herramienta', async () => {
    const controller = new AbortController()
    const events: PlanEvent[] = []
    for await (const event of createMockProvider({ sleep: instantSleep }).plan(input, controller.signal)) {
      events.push(event)
      if (events.length === 2) controller.abort()
    }
    expect(events.every((event) => event.type === 'token')).toBe(true)
  })
})
