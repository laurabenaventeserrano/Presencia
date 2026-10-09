import { describe, expect, it } from 'vitest'
import { focusByDay } from './focus'
import { addDays, dayDetail, dayName, exampleYear, gridWeeks, levelFor, weekday } from './grid'

const TODAY = '2026-10-09' // viernes

describe('levelFor', () => {
  it('D2 cinco tonos: 1–24, 25–59, 60–119, 120–179 y 180 o más; 0 es blanco', () => {
    expect([0, 1, 24, 25, 59, 60, 119, 120, 179, 180, 400].map(levelFor)).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5])
  })
})

describe('gridWeeks', () => {
  it('D1 los últimos 12 meses, un cuadrado por día, de lunes a domingo', () => {
    const weeks = gridWeeks(TODAY)
    expect(weeks).toHaveLength(53)
    expect(weeks.every((week) => week.length === 7 && weekday(week[0].date) === 0)).toBe(true)
    expect(weeks[weeks.length - 1].find((day) => day.date === TODAY)?.future).toBe(false)
    expect(weeks[weeks.length - 1].slice(5).every((day) => day.future)).toBe(true)
    expect(weeks[0][0].date <= addDays(TODAY, -365)).toBe(true)
  })
})

describe('textos', () => {
  it('D5 el detalle de un día', () => {
    expect(dayDetail('2026-10-12', 95, 3)).toBe('12 oct: 95 min de foco en 3 bloques')
    expect(dayDetail('2026-10-12', 25, 1)).toBe('12 oct: 25 min de foco en 1 bloque')
  })

  it('D7 el nombre accesible de cada cuadrado', () => {
    expect(dayName('2026-10-12', 95)).toBe('12 oct, 95 minutos de foco')
  })
})

describe('exampleYear', () => {
  const records = exampleYear(TODAY)
  const byDay = focusByDay(records, 'Europe/Madrid')

  it('D12 es determinista y está marcado como ejemplo', () => {
    expect(exampleYear(TODAY)).toEqual(records)
    expect(records.every((record) => record.example === true && record.kind === 'focus')).toBe(true)
  })

  it('D12 tiene ritmo: entre semana con foco, fines de semana casi en blanco, vacaciones y algún pico', () => {
    const days = [...byDay.entries()]
    const weekdays = days.filter(([date]) => weekday(date) < 5)
    const weekends = days.filter(([date]) => weekday(date) >= 5)
    expect(weekdays.length).toBeGreaterThan(180)
    expect(weekends.length).toBeLessThan(30)
    expect(days.some(([, day]) => day.minutes >= 180)).toBe(true)
    // Una semana entera sin nada (vacaciones).
    const empty = gridWeeks(TODAY).filter((week) => week.slice(0, 5).every((day) => !byDay.has(day.date) && !day.future))
    expect(empty.length).toBeGreaterThanOrEqual(2)
  })

  it('D13 termina ayer: hoy queda libre para lo real', () => {
    expect(byDay.has(TODAY)).toBe(false)
  })
})

describe('focusByDay', () => {
  it('D10 un bloque iniciado a las 23:50 cuenta para ese día', () => {
    const record = { id: 'a', kind: 'focus' as const, title: 'x', plannedMin: 25, focusMs: 25 * 60_000, startedAt: '2026-10-08T21:50:00.000Z', endedAt: '2026-10-08T22:15:00.000Z' }
    expect([...focusByDay([record], 'Europe/Madrid').keys()]).toEqual(['2026-10-08'])
  })

  it('D3 D4 solo cuenta el foco, con los minutos reales', () => {
    const base = { title: 'x', plannedMin: 50, startedAt: '2026-10-09T08:00:00.000Z', endedAt: '2026-10-09T09:00:00.000Z' }
    const days = focusByDay([
      { ...base, id: 'a', kind: 'focus', focusMs: 12 * 60_000 },
      { ...base, id: 'b', kind: 'break', focusMs: 5 * 60_000 },
      { ...base, id: 'c', kind: 'breathe', focusMs: 3 * 60_000 },
    ], 'Europe/Madrid')
    expect(days.get('2026-10-09')).toEqual({ minutes: 12, blocks: 1 })
  })
})
