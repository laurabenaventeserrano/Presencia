import { describe, expect, it } from 'vitest'
import type { PlanTask } from '../ai/types'
import { FALLBACK_TITLE, focusOrb, formatTime, hoyOrb, nextBreath, proposalRows, removeRow, rowReady, saveAction, stepMinutes, updateRow } from './logic'

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

describe('proposalRows', () => {
  const tasks: PlanTask[] = [{ id: 'a', title: 'Escribir la propuesta' }]

  it('muestra solo los bloques de foco con el título de su tarea', () => {
    const rows = proposalRows([
      { kind: 'focus', minutes: 50, taskId: 'a' },
      { kind: 'break', minutes: 5 },
      { kind: 'focus', minutes: 25, taskId: 'desconocida' },
    ], tasks)
    expect(rows.map((row) => [row.title, row.minutes, row.taskId])).toEqual([
      ['Escribir la propuesta', 50, 'a'],
      [FALLBACK_TITLE, 25, undefined],
    ])
  })

  it('una tarea inventada por la IA conserva su título, pero no se enlaza a ninguna tarea', () => {
    const [row] = proposalRows([{ kind: 'focus', minutes: 15, title: 'llamar al banco', taskId: 'intent-0' }], tasks)
    expect(row).toMatchObject({ title: 'llamar al banco', minutes: 15, taskId: undefined })
  })

  it('da a cada fila una clave distinta', () => {
    const rows = proposalRows([
      { kind: 'focus', minutes: 25, taskId: 'a' },
      { kind: 'focus', minutes: 25, taskId: 'a' },
    ], tasks)
    expect(new Set(rows.map((row) => row.key)).size).toBe(2)
  })
})

describe('updateRow y removeRow', () => {
  const rows = [
    { key: 'a', title: 'Leer', minutes: 25 },
    { key: 'b', title: 'Escribir', minutes: 50 },
  ]

  it('updateRow cambia solo la fila con esa clave', () => {
    expect(updateRow(rows, 'b', (row) => ({ ...row, title: 'Escribir el post' }))).toEqual([
      rows[0],
      { key: 'b', title: 'Escribir el post', minutes: 50 },
    ])
  })

  it('removeRow quita solo esa fila', () => {
    expect(removeRow(rows, 'a')).toEqual([rows[1]])
  })
})

describe('rowReady', () => {
  it('pide un título con algo más que espacios', () => {
    expect(rowReady({ key: 'k', title: 'Leer', minutes: 25 })).toBe(true)
    expect(rowReady({ key: 'k', title: '   ', minutes: 25 })).toBe(false)
  })
})

describe('saveAction', () => {
  it('una fila nueva crea la tarea con los minutos editados', () => {
    expect(saveAction({ key: 'k', title: 'Llamar al banco', minutes: 20 }))
      .toEqual({ type: 'crear', title: 'Llamar al banco', minutes: 20 })
  })

  it('una fila que ya es una tarea solo actualiza sus minutos', () => {
    expect(saveAction({ key: 'k', title: 'Leer', minutes: 35, taskId: 'a' }))
      .toEqual({ type: 'actualizar', taskId: 'a', minutes: 35 })
  })
})

describe('estado del orbe', () => {
  it('escucha mientras escribes o la IA responde', () => {
    expect(hoyOrb('', false)).toBe('reposo')
    expect(hoyOrb('   ', false)).toBe('reposo')
    expect(hoyOrb('diseñar', false)).toBe('escucha')
    expect(hoyOrb('', true)).toBe('escucha')
  })

  it('sigue la fase del bloque', () => {
    expect(focusOrb('listo')).toBe('reposo')
    expect(focusOrb('en-marcha')).toBe('foco')
    expect(focusOrb('en-pausa')).toBe('pausa')
    expect(focusOrb('hecho')).toBe('hecho')
  })
})

describe('nextBreath', () => {
  it('alterna Inspira y Espira y cuenta un ciclo al volver a Inspira', () => {
    const a = nextBreath({ phase: 'inspira', cycles: 0 })
    expect(a).toEqual({ phase: 'espira', cycles: 0 })
    expect(nextBreath(a)).toEqual({ phase: 'inspira', cycles: 1 })
  })

  it('tras nueve ciclos vuelve a empezar', () => {
    expect(nextBreath({ phase: 'espira', cycles: 9 })).toEqual({ phase: 'inspira', cycles: 1 })
  })
})
