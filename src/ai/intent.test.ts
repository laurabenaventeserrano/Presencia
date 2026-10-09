import { describe, expect, it } from 'vitest'
import { extractIntents, parseBudget } from './intent'

describe('extractIntents', () => {
  it('separa por comas, punto y coma e «y», y quita los arranques', () => {
    expect(extractIntents('Quiero escribir la propuesta, revisar correos y llamar a Marta'))
      .toEqual(['escribir la propuesta', 'revisar correos', 'llamar a Marta'])
  })

  it('quita el tiempo disponible y sus restos', () => {
    expect(extractIntents('Tengo tres horas, escribir el informe')).toEqual(['escribir el informe'])
    expect(extractIntents('')).toEqual([])
  })
})

describe('parseBudget', () => {
  it('lee el tiempo disponible en cifras y en palabras', () => {
    expect(parseBudget('tengo tres horas')).toBe(180)
    expect(parseBudget('90 minutos')).toBe(90)
    expect(parseBudget('media hora')).toBe(30)
    expect(parseBudget('una hora y media')).toBe(90)
    expect(parseBudget('hora y media')).toBe(90)
    expect(parseBudget('sin tiempo dicho')).toBeNull()
  })
})
