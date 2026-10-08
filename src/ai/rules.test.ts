import { describe, expect, it } from 'vitest'
import { buildBlocks, kindOf, minutesFor, orderByEnergy } from './rules'
import type { PlanTask, ProposedBlock } from './types'

const task = (id: string, title: string): PlanTask => ({ id, title })

describe('kindOf', () => {
  it('clasifica "diseñar la pantalla" como deep y "responder emails" como admin', () => {
    expect(kindOf('diseñar la pantalla')).toBe('deep')
    expect(kindOf('responder emails')).toBe('admin')
  })

  it('clasifica igual con y sin tilde', () => {
    expect(kindOf('disenar')).toBe(kindOf('diseñar'))
    expect(kindOf('DISEÑAR')).toBe('deep')
  })
})

describe('orderByEnergy', () => {
  it('ordena el trabajo profundo antes que las gestiones', () => {
    const tasks = [
      task('a', 'Responder emails'),
      task('b', 'Revisar el informe'),
      task('c', 'Escribir el artículo'),
      task('d', 'Pagar facturas'),
      task('e', 'Programar la API'),
    ]
    expect(orderByEnergy(tasks).map((t) => t.id)).toEqual(['c', 'e', 'b', 'a', 'd'])
  })

  it('no modifica el array original', () => {
    const tasks = [task('a', 'Responder emails'), task('b', 'Escribir el artículo')]
    const snapshot = [...tasks]
    orderByEnergy(tasks)
    expect(tasks).toEqual(snapshot)
  })
})

describe('minutesFor', () => {
  it('asigna 50, 25 y 15 minutos según el tipo', () => {
    expect(minutesFor[kindOf('Investigar usuarios')]).toBe(50)
    expect(minutesFor[kindOf('Leer el feedback')]).toBe(25)
    expect(minutesFor[kindOf('Llamar al banco')]).toBe(15)
  })
})

describe('buildBlocks', () => {
  it('ignora tareas hechas y no deja una pausa después del último bloque', () => {
    const tasks = [task('a', 'Responder emails'), task('b', 'Escribir el artículo'), task('c', 'Revisar el informe')]
    const blocks = buildBlocks({ intention: '', tasks, memory: [] }, new Set(['c']))
    expect(blocks).toEqual([
      { kind: 'focus', minutes: 50, title: 'Escribir el artículo', taskId: 'b' },
      { kind: 'break', minutes: 5 },
      { kind: 'focus', minutes: 15, title: 'Responder emails', taskId: 'a' },
    ])
    expect(blocks[blocks.length - 1].kind).toBe('focus')
  })

  const tasks = [
    task('write', 'Escribir la propuesta del proyecto'),
    task('email', 'Responder emails pendientes'),
    task('review', 'Revisar el contrato con el cliente'),
    task('design', 'Diseñar la pantalla de inicio'),
    task('bills', 'Pagar las facturas del mes'),
  ]
  const plan = (intention: string) => buildBlocks({ intention, tasks, memory: [] })
  const focusMinutes = (blocks: ProposedBlock[]) =>
    blocks.filter((block) => block.kind === 'focus').reduce((total, block) => total + block.minutes, 0)

  it('dos frases distintas dan planes distintos', () => {
    const first = plan('Quiero escribir la propuesta')
    const second = plan('Tengo que pagar las facturas y responder emails')
    expect(first).toEqual([{ kind: 'focus', minutes: 50, title: 'Escribir la propuesta del proyecto', taskId: 'write' }])
    expect(second).toEqual([
      { kind: 'focus', minutes: 15, title: 'Pagar las facturas del mes', taskId: 'bills' },
      { kind: 'break', minutes: 5 },
      { kind: 'focus', minutes: 15, title: 'Responder emails pendientes', taskId: 'email' },
    ])
  })

  it('una intención entendida sin tarea parecida crea una tarea temporal', () => {
    expect(plan('llamar al banco')).toEqual([{ kind: 'focus', minutes: 15, title: 'llamar al banco', taskId: 'intent-0' }])
  })

  it('"fjnewj" da una lista vacía', () => {
    expect(plan('fjnewj')).toEqual([])
  })

  it('"tengo una hora" limita el foco a 60 minutos', () => {
    const intention = 'Diseñar la pantalla, revisar el contrato y responder emails'
    expect(focusMinutes(plan(intention))).toBeGreaterThan(60)
    const limited = plan(`${intention}, tengo una hora`)
    expect(focusMinutes(limited)).toBeLessThanOrEqual(60)
    expect(limited).toEqual([{ kind: 'focus', minutes: 50, title: 'Diseñar la pantalla de inicio', taskId: 'design' }])
  })

  it('con solo un presupuesto usa las tareas pendientes recortadas', () => {
    const limited = plan('90 minutos')
    expect(focusMinutes(limited)).toBeLessThanOrEqual(90)
    expect(limited.length).toBeGreaterThan(0)
  })

  it('la misma frase da siempre el mismo resultado', () => {
    const intention = 'Quiero diseñar la pantalla y revisar el contrato, tengo 2 horas'
    expect(plan(intention)).toEqual(plan(intention))
  })
})
