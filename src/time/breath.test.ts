import { describe, expect, it } from 'vitest'
import { breathCycleOffsetMs, breathPhase } from './breath'

describe('breathPhase', () => {
  it('R2 alterna «Coge aire» y «Suéltalo» cada 5 segundos', () => {
    expect(breathPhase(0)).toBe('Coge aire')
    expect(breathPhase(4_999)).toBe('Coge aire')
    expect(breathPhase(5_000)).toBe('Suéltalo')
    expect(breathPhase(10_000)).toBe('Coge aire')
  })

  it('el orbe sigue el mismo ciclo de 10 segundos', () => {
    expect(breathCycleOffsetMs(12_000)).toBe(2_000)
  })
})
