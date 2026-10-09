import { beforeEach, describe, expect, it } from 'vitest'
import { emptyState } from '../state/types'
import { loadState, saveState, STORAGE_KEY } from '.'

const data = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value) },
    removeItem: (key: string) => { data.delete(key) },
  },
})

beforeEach(() => data.clear())

describe('storage', () => {
  it('B2 lo guardado vuelve igual al recargar', () => {
    const active = { id: 'a', kind: 'focus' as const, title: 'Leer', plannedMin: 25, extraMin: 0, totalMs: 1_500_000, status: 'running' as const, startedAt: '2026-10-09T08:00:00.000Z', endsAt: 123 }
    saveState({ ...emptyState, active })
    expect(loadState('2026-10-09').active).toEqual(active)
  })

  it('descarta el plan si no es de hoy', () => {
    saveState({ ...emptyState, plan: { date: '2026-10-08', intent: '', batch: 0, items: [] } })
    expect(loadState('2026-10-09').plan).toBeNull()
  })

  it('con datos rotos empieza vacío y no lanza', () => {
    data.set(STORAGE_KEY, '{no es json')
    expect(loadState('2026-10-09')).toEqual(emptyState)
  })

  it('borra la clave antigua de la versión con tareas', () => {
    data.set('presencia-app-focus-v1', '{}')
    loadState('2026-10-09')
    expect(data.has('presencia-app-focus-v1')).toBe(false)
  })
})
