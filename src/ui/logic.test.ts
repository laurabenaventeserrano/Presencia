import { describe, expect, it } from 'vitest'
import { formatTime, stepMinutes } from './logic'

describe('formatTime', () => {
  it('formatea minutos y segundos con dos cifras', () => {
    expect(formatTime(1458)).toBe('24:18')
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(65)).toBe('01:05')
  })

  it('nunca muestra tiempo negativo ni decimales', () => {
    expect(formatTime(-3)).toBe('00:00')
    expect(formatTime(59.9)).toBe('00:59')
  })
})

describe('stepMinutes', () => {
  it('sube y baja de 5 en 5', () => {
    expect(stepMinutes(25, 1)).toBe(30)
    expect(stepMinutes(25, -1)).toBe(20)
  })

  it('no baja de 5 ni sube de 120', () => {
    expect(stepMinutes(5, -1)).toBe(5)
    expect(stepMinutes(120, 1)).toBe(120)
  })
})
