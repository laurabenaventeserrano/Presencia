import { describe, expect, it } from 'vitest'
import type { Task } from '../store'
import { extractIntents, isUnderstood, matchTasks, parseBudget } from './intent'

const task = (id: string, title: string): Task => ({ id, title, createdAt: 0 })

const tasks = [task('design', 'Diseñar la pantalla de inicio'), task('email', 'Responder emails pendientes')]

describe('extractIntents', () => {
  it('separa por " y ", comas y punto y coma y quita los arranques', () => {
    expect(extractIntents('Quiero diseñar la pantalla y responder emails; tengo que llamar al banco, voy a leer'))
      .toEqual(['diseñar la pantalla', 'responder emails', 'llamar al banco', 'leer'])
  })

  it('quita el presupuesto y devuelve vacío si no hay intención', () => {
    expect(extractIntents('Revisar el contrato en 90 minutos')).toEqual(['Revisar el contrato en'])
    expect(extractIntents('')).toEqual([])
    expect(extractIntents(' , ; ')).toEqual([])
  })
})

describe('parseBudget', () => {
  it('detecta horas, minutos y media hora', () => {
    expect(parseBudget('tengo una hora')).toBe(60)
    expect(parseBudget('Tengo UNA HORA')).toBe(60)
    expect(parseBudget('dispongo de 2 horas')).toBe(120)
    expect(parseBudget('solo 90 minutos')).toBe(90)
    expect(parseBudget('media hora')).toBe(30)
  })

  it('devuelve null si no hay presupuesto', () => {
    expect(parseBudget('diseñar la pantalla')).toBeNull()
  })
})

describe('matchTasks', () => {
  it('usa la tarea que comparte una palabra significativa, sin tildes ni mayúsculas', () => {
    expect(matchTasks(['la PANTALLA'], tasks)).toEqual([tasks[0]])
  })

  it('crea una tarea temporal si no hay coincidencias', () => {
    expect(matchTasks(['responder emails', 'llamar al banco'], tasks))
      .toEqual([tasks[1], { id: 'intent-1', title: 'llamar al banco', createdAt: 0 }])
  })

  it('no repite una tarea si dos intenciones apuntan a ella', () => {
    expect(matchTasks(['la pantalla', 'pantalla de inicio'], tasks)).toEqual([tasks[0]])
  })

  it('ignora las palabras vacías y las de 3 letras o menos', () => {
    expect(matchTasks(['para los del'], [task('x', 'Para los del equipo')])[0].id).toBe('intent-0')
  })
})

describe('isUnderstood', () => {
  it('entiende intenciones que coinciden con una tarea o con palabras clave', () => {
    expect(isUnderstood('la pantalla', tasks)).toBe(true)
    expect(isUnderstood('llamar al banco', tasks)).toBe(true)
    expect(isUnderstood('preparar la reunión', tasks)).toBe(true)
    expect(isUnderstood('escribir el informe', [])).toBe(true)
  })

  it('no entiende texto sin sentido', () => {
    expect(isUnderstood('fjnewj', tasks)).toBe(false)
    expect(isUnderstood('tengo', tasks)).toBe(false)
  })
})
