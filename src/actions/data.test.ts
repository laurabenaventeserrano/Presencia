import { describe, expect, it } from 'vitest'
import { emptyState } from '../state/types'
import { clearData, loadExample, removeExample } from './data'
import { finish, startTimer } from './timer'
import { state, testCtx } from './test-utils'

describe('datos de ejemplo y borrado', () => {
  it('D12 D13 D14 el ejemplo se suma a lo real y se quita sin tocarlo', () => {
    const t = testCtx()
    let s = startTimer(state(), t.ctx(), { title: 'Real', minutes: 25 })
    t.advance(25 * 60_000)
    s = finish(s, t.ctx())
    const withExample = loadExample(s, t.ctx())
    expect(withExample.records.length).toBeGreaterThan(100)
    expect(loadExample(withExample, t.ctx())).toBe(withExample)
    expect(removeExample(withExample).records).toEqual(s.records)
  })

  it('D15 borrar lo deja todo en blanco', () => {
    const t = testCtx()
    expect(clearData()).toEqual(emptyState)
    expect(loadExample(state(), t.ctx()).records.length).toBeGreaterThan(0)
  })
})
