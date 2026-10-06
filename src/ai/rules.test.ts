import { describe, expect, it } from 'vitest'
import type { Task } from '../store'
import { buildBlocks, kindOf, minutesFor, orderByEnergy } from './rules'

const task = (id: string, title: string): Task => ({ id, title, createdAt: 0 })

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
    const blocks = buildBlocks({ intention: 'Avanzar', tasks, memory: [] }, new Set(['c']))
    expect(blocks).toEqual([
      { kind: 'focus', minutes: 50, taskId: 'b' },
      { kind: 'break', minutes: 5 },
      { kind: 'focus', minutes: 15, taskId: 'a' },
    ])
    expect(blocks[blocks.length - 1].kind).toBe('focus')
  })
})
