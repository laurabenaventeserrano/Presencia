import { describe, expect, it } from 'vitest'
import { buildPlan, formatDuration, kindOf, summarize } from './rules'

const DATE = '2026-10-09'
const plan = (intent: string, batch = 0, date = DATE) => buildPlan({ intent, date, batch })
const focus = (items: ReturnType<typeof plan>) => items.filter((item) => item.kind === 'focus')

describe('kindOf', () => {
  it('distingue trabajo profundo, revisión y gestiones, con y sin tilde', () => {
    expect(kindOf('Diseñar la pantalla')).toBe('deep')
    expect(kindOf('disenar')).toBe('deep')
    expect(kindOf('Revisar correos')).toBe('review')
    expect(kindOf('Llamar a Marta')).toBe('admin')
  })
})

describe('buildPlan', () => {
  it('A2 convierte lo que cuentas en bloques con título y minutos, lo más exigente antes', () => {
    const items = plan('escribir la propuesta, revisar correos y llamar a Marta')
    expect(focus(items).map((item) => [item.title, item.plannedMin])).toEqual([
      ['Escribir la propuesta', 50],
      ['Revisar correos', 25],
      ['Llamar a Marta', 15],
    ])
  })

  it('A3 siempre hay plan: un texto sin sentido es el título de un único bloque', () => {
    expect(plan('asdf')).toEqual([{ kind: 'focus', title: 'Asdf', plannedMin: 15 }])
  })

  it('A4 con el campo vacío sugiere un día variado de 3 a 4 bloques de foco', () => {
    const items = focus(plan(''))
    expect(items.length).toBeGreaterThanOrEqual(3)
    expect(items.length).toBeLessThanOrEqual(4)
    expect(new Set(items.map((item) => item.title)).size).toBe(items.length)
  })

  it('A5 otra tanda cambia la lista entera y la misma tanda la repite', () => {
    const intent = 'escribir la propuesta, revisar correos y llamar a Marta'
    const batches = [0, 1, 2, 3].map((batch) => plan(intent, batch))
    for (let i = 1; i < batches.length; i++) {
      const before = focus(batches[i - 1])
      const after = focus(batches[i])
      // Ningún bloque queda igual que en la tanda anterior.
      expect(after.every((item) => !before.some((old) => old.title === item.title && old.plannedMin === item.plannedMin))).toBe(true)
    }
    expect(plan(intent, 2)).toEqual(plan(intent, 2))
    expect(plan('', 1)).toEqual(plan('', 1))
  })

  it('A5 el día también forma parte de la semilla', () => {
    const days = ['2026-10-09', '2026-10-10', '2026-10-11', '2026-10-12'].map((date) => plan('', 0, date).map((item) => item.title).join())
    expect(new Set(days).size).toBeGreaterThan(1)
  })

  it('A15 una lista larga incluye un Respirar de 3 minutos entre bloques de foco', () => {
    const items = plan('escribir la propuesta, revisar correos y llamar a Marta')
    const index = items.findIndex((item) => item.kind === 'breathe')
    expect(items[index]).toEqual({ kind: 'breathe', title: 'Respirar', plannedMin: 3 })
    expect(index).toBeGreaterThan(0)
    expect(index).toBeLessThan(items.length - 1)
    expect(plan('escribir la propuesta').some((item) => item.kind === 'breathe')).toBe(false)
  })

  it('lee el tiempo disponible y recorta sin dejar el plan vacío', () => {
    const items = plan('escribir el informe, diseñar la portada y revisar correos, tengo una hora')
    expect(focus(items).reduce((total, item) => total + item.plannedMin, 0)).toBeLessThanOrEqual(60)
    expect(plan('escribir el libro, tengo 10 minutos')).toHaveLength(1)
  })
})

describe('summarize', () => {
  it('resume en una frase con el tiempo total', () => {
    expect(summarize([{ kind: 'focus', title: 'A', plannedMin: 50 }, { kind: 'focus', title: 'B', plannedMin: 85 }])).toBe('Te propongo 2 bloques, 2 h 15 min en total.')
    expect(formatDuration(45)).toBe('45 min')
    expect(formatDuration(60)).toBe('1 h')
  })
})
