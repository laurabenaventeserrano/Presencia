import { describe, expect, it } from 'vitest'
import { remainingMs, tabTitle, workedMs } from '../time'
import { extend, finish, pause, resume, startBreathing, startTimer } from './timer'
import { state, testCtx } from './test-utils'

describe('temporizador por endsAt', () => {
  it('B2 la cuenta atrás sale de endsAt y baja con el tiempo', () => {
    const t = testCtx()
    const s = startTimer(state(), t.ctx(), { title: 'Escribir', minutes: 25 })
    expect(s.active?.endsAt).toBe(t.now() + 25 * 60_000)
    t.advance(60_000)
    expect(remainingMs(s.active!, t.now())).toBe(24 * 60_000)
  })

  it('B1 sin título se llama «Sin título»', () => {
    const t = testCtx()
    expect(startTimer(state(), t.ctx(), { title: '  ', minutes: 15 }).active?.title).toBe('Sin título')
  })

  it('B3 pausar congela el tiempo y reanudar sigue donde estaba', () => {
    const t = testCtx()
    let s = startTimer(state(), t.ctx(), { title: 'Leer', minutes: 10 })
    t.advance(2 * 60_000)
    s = pause(s, t.ctx())
    expect(s.active).toMatchObject({ status: 'paused', remainingMs: 8 * 60_000, endsAt: undefined })
    t.advance(30 * 60_000)
    expect(remainingMs(s.active!, t.now())).toBe(8 * 60_000)
    s = resume(s, t.ctx())
    expect(s.active?.endsAt).toBe(t.now() + 8 * 60_000)
  })

  it('B7 solo hay un bloque activo a la vez', () => {
    const t = testCtx()
    const s = startTimer(state(), t.ctx(), { title: 'Uno', minutes: 25 })
    expect(startTimer(s, t.ctx(), { title: 'Dos', minutes: 25 })).toBe(s)
    expect(startBreathing(s, t.ctx(), { minutes: 1 })).toBe(s)
  })

  it('B9 el título de la pestaña muestra el tiempo solo mientras corre', () => {
    const t = testCtx()
    const s = startTimer(state(), t.ctx(), { title: 'Uno', minutes: 25 })
    expect(tabTitle(s.active, t.now())).toBe('25:00 · Presencia')
    expect(tabTitle(pause(s, t.ctx()).active, t.now())).toBe('Presencia')
    expect(tabTitle(null, t.now())).toBe('Presencia')
  })

  it('+5 min suma a lo que queda y cuenta como trabajado', () => {
    const t = testCtx()
    let s = startTimer(state(), t.ctx(), { title: 'Uno', minutes: 5 })
    t.advance(7 * 60_000)
    s = extend(s, t.ctx())
    expect(remainingMs(s.active!, t.now())).toBe(5 * 60_000)
    t.advance(5 * 60_000)
    expect(workedMs(s.active!, t.now())).toBe(10 * 60_000)
  })

  it('terminar antes de tiempo guarda solo los minutos reales', () => {
    const t = testCtx()
    let s = startTimer(state(), t.ctx(), { title: 'Uno', minutes: 25 })
    t.advance(10 * 60_000)
    s = finish(s, t.ctx())
    expect(s.active).toBeNull()
    expect(s.records).toMatchObject([{ kind: 'focus', title: 'Uno', plannedMin: 25, focusMs: 10 * 60_000 }])
  })
})
