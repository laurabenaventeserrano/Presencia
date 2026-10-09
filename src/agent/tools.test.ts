import { describe, expect, it } from 'vitest'
import { createMockProvider } from '../ai/mock-provider'
import { emptyState, type AppState } from '../state/types'
import { proposePlan, readDay, readHistory, tools } from './tools'

const TZ = 'Europe/Madrid'
const record = (startedAt: string, minutes: number, kind: 'focus' | 'break' | 'breathe' = 'focus') =>
  ({ id: startedAt, kind, title: 'x', plannedMin: minutes, focusMs: minutes * 60_000, startedAt, endedAt: startedAt })

const state: AppState = {
  ...emptyState,
  plan: {
    date: '2026-10-09',
    intent: 'escribir y llamar',
    batch: 0,
    items: [
      { id: 'a', kind: 'focus', title: 'Escribir', plannedMin: 50, status: 'done', doneMin: 45 },
      { id: 'b', kind: 'focus', title: 'Llamar', plannedMin: 15, status: 'pending' },
    ],
  },
  records: [
    record('2026-10-09T08:00:00.000Z', 45),
    record('2026-10-09T09:00:00.000Z', 5, 'break'),
    record('2026-10-08T08:00:00.000Z', 30),
    record('2026-10-06T21:50:00.000Z', 20), // 23:50 en Madrid: cuenta para el 6
  ],
}

describe('herramientas para un agente', () => {
  it('X1 propose_plan devuelve un borrador con resumen y bloques, sin tocar el estado', async () => {
    const before = structuredClone(state)
    const result = proposePlan.run({ intent: 'escribir la propuesta, revisar correos y llamar a Marta', date: '2026-10-09' })
    expect(result.items.length).toBeGreaterThanOrEqual(3)
    expect(result.summary).toMatch(/^Te propongo \d+ bloques/)
    for await (const event of createMockProvider({ sleep: () => Promise.resolve() }).plan({ intent: 'leer', date: '2026-10-09', batch: 0 })) void event
    expect(state).toEqual(before)
  })

  it('X2 read_day devuelve el plan y los minutos de foco de hoy', () => {
    expect(readDay.run(state, '2026-10-09', TZ)).toEqual({
      date: '2026-10-09',
      intent: 'escribir y llamar',
      items: [
        { title: 'Escribir', kind: 'focus', plannedMin: 50, status: 'done', doneMin: 45 },
        { title: 'Llamar', kind: 'focus', plannedMin: 15, status: 'pending', doneMin: undefined },
      ],
      focusMinutes: 45,
    })
  })

  it('X2 read_history devuelve los minutos de foco por día, sin descansos', () => {
    expect(readHistory.run(state, { days: 4 }, '2026-10-09', TZ)).toEqual([
      { date: '2026-10-06', focusMinutes: 20 },
      { date: '2026-10-07', focusMinutes: 0 },
      { date: '2026-10-08', focusMinutes: 30 },
      { date: '2026-10-09', focusMinutes: 45 },
    ])
  })

  it('cada herramienta tiene nombre, descripción y esquema', () => {
    expect(tools.map((tool) => tool.name)).toEqual(['propose_plan', 'read_day', 'read_history'])
    expect(tools.every((tool) => tool.description && tool.parameters.type === 'object')).toBe(true)
  })
})
