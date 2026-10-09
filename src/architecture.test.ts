/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest'

// Todo el código de src (sin los tests), leído como texto.
const modules = import.meta.glob(['./**/*.ts', './**/*.tsx', '!./**/*.test.ts', '!./**/*.test.tsx'], { query: '?raw', import: 'default', eager: true })
const source = Object.entries(modules).map(([path, text]) => ({ path, text: String(text) }))

const outside = (pattern: RegExp, ...allowed: string[]) =>
  source.filter((f) => pattern.test(f.text) && !allowed.some((dir) => f.path.startsWith(dir))).map((f) => f.path)

describe('X3 todo cambio de estado pasa por src/actions', () => {
  it('hay código que revisar', () => {
    expect(source.length).toBeGreaterThan(5)
  })

  it('solo src/actions llama a setState del store', () => {
    expect(outside(/\.setState\(/, './actions/')).toEqual([])
  })

  it('solo src/actions guarda en el almacenamiento', () => {
    expect(outside(/saveState/, './actions/', './storage/')).toEqual([])
  })

  it('solo src/storage toca localStorage', () => {
    expect(outside(/localStorage/, './storage/')).toEqual([])
  })
})
