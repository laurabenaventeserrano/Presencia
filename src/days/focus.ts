import type { BlockRecord } from '../state/types'

export type DayFocus = { minutes: number; blocks: number }

// La fecha 'YYYY-MM-DD' de un instante en una zona horaria. Un bloque cuenta para el día en que empezó.
export const dateIn = (iso: string, timeZone: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))

// Minutos de foco y número de bloques por día. Solo cuentan los bloques de foco.
export const focusByDay = (records: readonly BlockRecord[], timeZone: string): Map<string, DayFocus> => {
  const ms = new Map<string, { ms: number; blocks: number }>()
  for (const record of records) {
    if (record.kind !== 'focus' || record.focusMs <= 0) continue
    const date = dateIn(record.startedAt, timeZone)
    const day = ms.get(date) ?? { ms: 0, blocks: 0 }
    ms.set(date, { ms: day.ms + record.focusMs, blocks: day.blocks + 1 })
  }
  return new Map([...ms].map(([date, day]) => [date, { minutes: Math.round(day.ms / 60_000), blocks: day.blocks }]))
}
