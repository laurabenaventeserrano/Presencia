import { describe, expect, it } from 'vitest'
import { focusByDay } from './focus'

const record = (startedAt: string, minutes: number, kind: 'focus' | 'break' | 'breathe') =>
  ({ id: `${startedAt}-${kind}`, kind, title: 'x', plannedMin: minutes, focusMs: minutes * 60_000, startedAt, endedAt: startedAt })

describe('focusByDay', () => {
  it('C2 un descanso no cuenta como foco', () => {
    const days = focusByDay([record('2026-10-09T08:00:00.000Z', 25, 'focus'), record('2026-10-09T09:00:00.000Z', 5, 'break')], 'Europe/Madrid')
    expect(days.get('2026-10-09')).toEqual({ minutes: 25, blocks: 1 })
  })

  it('R6 una respiración tampoco cuenta', () => {
    expect(focusByDay([record('2026-10-09T08:00:00.000Z', 3, 'breathe')], 'Europe/Madrid').size).toBe(0)
  })
})
