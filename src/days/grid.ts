import { createRng, hashString } from '../ai/rng'
import type { BlockRecord } from '../state/types'

// La cuadrícula de días (docs/ARCHITECTURE.md, sección 4). Todo puro y con tests.

// Umbrales de color, en una constante para poder ajustarlos (SPEC, supuesto 4).
export const LEVEL_THRESHOLDS = [1, 25, 60, 120, 180] as const

// 0 es blanco; 1 a 5 son los cinco tonos.
export const levelFor = (minutes: number) => LEVEL_THRESHOLDS.filter((threshold) => minutes >= threshold).length

const DAY_MS = 86_400_000
const toUtc = (date: string) => { const [y, m, d] = date.split('-').map(Number); return Date.UTC(y, m - 1, d) }
const fromUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10)
export const addDays = (date: string, days: number) => fromUtc(toUtc(date) + days * DAY_MS)
// 0 = lunes … 6 = domingo.
export const weekday = (date: string) => (new Date(toUtc(date)).getUTCDay() + 6) % 7

export type GridDay = { date: string; future: boolean }

// Las últimas `weeks` semanas, de lunes a domingo, terminando en la semana de hoy.
export const gridWeeks = (today: string, weeks = 53): GridDay[][] => {
  const lastMonday = addDays(today, -weekday(today))
  const firstMonday = addDays(lastMonday, -7 * (weeks - 1))
  return Array.from({ length: weeks }, (_, week) => Array.from({ length: 7 }, (__, day) => {
    const date = addDays(firstMonday, week * 7 + day)
    return { date, future: date > today }
  }))
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic']
export const shortDate = (date: string) => { const [, m, d] = date.split('-').map(Number); return `${d} ${MONTHS[m - 1]}` }

// «12 oct: 95 min de foco en 3 bloques»
export const dayDetail = (date: string, minutes: number, blocks: number) =>
  minutes === 0 ? `${shortDate(date)}: sin foco` : `${shortDate(date)}: ${minutes} min de foco en ${blocks} ${blocks === 1 ? 'bloque' : 'bloques'}`

// «12 oct, 95 minutos de foco»
export const dayName = (date: string, minutes: number) => `${shortDate(date)}, ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} de foco`

// Un año de una persona de ejemplo: foco entre lunes y viernes, fines de semana casi en blanco,
// dos semanas de vacaciones y algún pico. Determinista y marcado como ejemplo. Termina ayer.
export const exampleYear = (today: string): BlockRecord[] => {
  const rng = createRng(hashString('presencia-ejemplo'))
  const vacations = [addDays(today, -200), addDays(today, -60)].map((start) => addDays(start, -weekday(start)))
  const records: BlockRecord[] = []
  for (let back = 364; back >= 1; back--) {
    const date = addDays(today, -back)
    const day = weekday(date)
    if (vacations.some((start) => date >= start && date < addDays(start, 7))) continue
    const weekend = day >= 5
    if (weekend && rng() > 0.15) continue
    const peak = !weekend && rng() < 0.06
    const minutes = weekend ? 15 + Math.floor(rng() * 25) : peak ? 190 + Math.floor(rng() * 60) : Math.floor(rng() * 170)
    if (minutes < 5) continue
    const blocks = Math.max(1, Math.round(minutes / 50))
    for (let index = 0; index < blocks; index++) {
      const start = `${date}T${String(9 + index * 2).padStart(2, '0')}:00:00`
      const focusMs = Math.round((minutes / blocks) * 60_000)
      records.push({ id: `ejemplo-${date}-${index}`, kind: 'focus', title: 'Ejemplo', plannedMin: Math.round(minutes / blocks), focusMs, startedAt: start, endedAt: start, example: true })
    }
  }
  return records
}
