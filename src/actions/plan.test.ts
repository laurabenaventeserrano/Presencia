import { describe, expect, it } from 'vitest'
import { remainingMs } from '../time'
import { addItem, clampMinutes, createPlan, postponeActive, postponeItem, removeItem, rollDay, startItem, updateItem } from './plan'
import { finish, startTimer } from './timer'
import { state, testCtx } from './test-utils'

const draft = [
  { id: 'a', kind: 'focus' as const, title: 'Escribir', plannedMin: 50 },
  { id: 'b', kind: 'focus' as const, title: 'Revisar correos', plannedMin: 25 },
]

const withPlan = (t = testCtx()) => ({ t, s: createPlan(state(), t.ctx(), { intent: 'escribir y revisar', batch: 0, items: draft }) })

describe('acciones del plan', () => {
  it('createPlan convierte el borrador en el plan de hoy, todo pendiente', () => {
    const { s } = withPlan()
    expect(s.plan).toMatchObject({ date: '2026-10-09', intent: 'escribir y revisar', batch: 0 })
    expect(s.plan?.items.map((item) => item.status)).toEqual(['pending', 'pending'])
  })

  it('A6 cambiar el título se usa al empezar', () => {
    const { t, s } = withPlan()
    const next = startItem(updateItem(s, t.ctx(), 'a', { title: 'Escribir el resumen' }), t.ctx(), 'a')
    expect(next.active).toMatchObject({ title: 'Escribir el resumen', planItemId: 'a' })
  })

  it('A7 los minutos van de 5 a 120', () => {
    expect(clampMinutes(500)).toBe(120)
    expect(clampMinutes(2)).toBe(5)
    expect(clampMinutes(37)).toBe(37)
    const { t, s } = withPlan()
    expect(updateItem(s, t.ctx(), 'b', { plannedMin: 500 }).plan?.items[1].plannedMin).toBe(120)
  })

  it('A8 quitar y deshacer devuelve el bloque a su sitio', () => {
    const { t, s } = withPlan()
    const removed = removeItem(s, t.ctx(), 'a')
    expect(removed.plan?.items.map((item) => item.id)).toEqual(['b'])
    const restored = addItem(removed, t.ctx(), { item: s.plan!.items[0], index: 0 })
    expect(restored.plan?.items.map((item) => item.id)).toEqual(['a', 'b'])
  })

  it('A9 añadir un bloque vacío listo para editar', () => {
    const { t, s } = withPlan()
    expect(addItem(s, t.ctx()).plan?.items[2]).toMatchObject({ title: '', plannedMin: 25, status: 'pending' })
    expect(addItem(state(), t.ctx()).plan?.items).toHaveLength(1)
  })

  it('A10 empezar un bloque arranca con su título y minutos, y solo uno a la vez', () => {
    const { t, s } = withPlan()
    const started = startItem(s, t.ctx(), 'b')
    expect(started.active).toMatchObject({ title: 'Revisar correos', plannedMin: 25, planItemId: 'b' })
    expect(started.plan?.items[1].status).toBe('running')
    expect(startItem(started, t.ctx(), 'a')).toBe(started)
  })

  it('A11 al terminar queda hecho con los minutos reales y el siguiente no arranca solo', () => {
    const { t, s } = withPlan()
    let next = startItem(s, t.ctx(), 'a')
    t.advance(40 * 60_000)
    next = finish(next, t.ctx())
    expect(next.plan?.items[0]).toMatchObject({ status: 'done', doneMin: 40 })
    expect(next.plan?.items[1].status).toBe('pending')
    expect(next.active).toBeNull()
  })

  it('A12 aplazar deja el bloque «más tarde» hasta una hora', () => {
    const { t, s } = withPlan()
    const next = postponeItem(s, t.ctx(), 'b', 30)
    expect(next.plan?.items[1]).toMatchObject({ status: 'later', laterUntil: new Date(t.now() + 30 * 60_000).toISOString() })
  })

  it('B4 aplazar el bloque en marcha conserva lo que le queda y guarda lo trabajado', () => {
    const { t, s } = withPlan()
    let next = startItem(s, t.ctx(), 'a')
    t.advance(20 * 60_000)
    next = postponeItem(next, t.ctx(), 'a', 15)
    expect(next.active).toBeNull()
    expect(next.plan?.items[0]).toMatchObject({ status: 'later', remainingMs: 30 * 60_000, workedMs: 20 * 60_000 })
    expect(next.records).toMatchObject([{ kind: 'focus', focusMs: 20 * 60_000 }])
    // Al retomarlo sigue con lo que le quedaba, y al terminar cuenta todo lo trabajado.
    next = startItem(next, t.ctx(), 'a')
    expect(remainingMs(next.active!, t.now())).toBe(30 * 60_000)
    t.advance(30 * 60_000)
    expect(finish(next, t.ctx()).plan?.items[0]).toMatchObject({ status: 'done', doneMin: 50 })
  })

  it('B4 un bloque del temporizador vuelve a Tu día como «más tarde»', () => {
    const t = testCtx()
    let s = startTimer(state(), t.ctx(), { title: 'Leer', minutes: 25 })
    t.advance(5 * 60_000)
    s = postponeActive(s, t.ctx(), 60)
    expect(s.active).toBeNull()
    expect(s.plan?.items).toMatchObject([{ title: 'Leer', status: 'later', remainingMs: 20 * 60_000 }])
    expect(s.records[0].focusMs).toBe(5 * 60_000)
  })

  it('A13 al cambiar de día, el plan de ayer desaparece pero sus registros quedan', () => {
    const { t, s } = withPlan()
    let next = startItem(s, t.ctx(), 'a')
    t.advance(10 * 60_000)
    next = finish(next, t.ctx())
    t.advance(24 * 60 * 60_000)
    const rolled = rollDay(next, t.ctx())
    expect(rolled.plan).toBeNull()
    expect(rolled.records).toHaveLength(1)
  })
})
