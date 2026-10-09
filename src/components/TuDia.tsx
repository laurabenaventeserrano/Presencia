import { KeyboardEvent, useEffect, useRef, useState } from 'react'
import { formatDuration, totalMinutes } from '../ai/rules'
import type { PlanItem } from '../state/types'
import { timeOfDay } from '../time'
import { MAX_MINUTES, MIN_MINUTES, stepMinutes } from '../ui/logic'
import { BUSY_TEXT } from './Hoy'
import { Icon } from './Icon'

export type DayRow = Pick<PlanItem, 'id' | 'kind' | 'title' | 'plannedMin' | 'status' | 'laterUntil' | 'doneMin'>

export const statusText = (row: DayRow) => {
  if (row.status === 'done') return `Hecho, ${row.doneMin ?? row.plannedMin} min`
  if (row.status === 'later' && row.laterUntil) return `Más tarde, ${timeOfDay(row.laterUntil)}`
  if (row.status === 'running') return 'En curso'
  return 'Pendiente'
}

// Si alguien escribe un número fuera de 5–120, se corrige y se explica (A7).
export const minutesNote = (typed: number) => {
  if (typed > MAX_MINUTES) return `Como máximo ${MAX_MINUTES} minutos: lo he dejado en ${MAX_MINUTES}.`
  if (typed < MIN_MINUTES) return `Como mínimo ${MIN_MINUTES} minutos: lo he dejado en ${MIN_MINUTES}.`
  return ''
}

export type Undo = { title: string }

type TuDiaProps = {
  rows: DayRow[]
  busy: boolean
  thinking: boolean
  undo: Undo | null
  onAnother: () => void
  onRename: (id: string, title: string) => void
  onMinutes: (id: string, minutes: number) => void
  onRemove: (id: string) => void
  onUndo: () => void
  onAdd: () => void
  onStart: (id: string) => void
  onLater: (id: string) => void
}

type RowProps = Pick<TuDiaProps, 'busy' | 'onRename' | 'onMinutes' | 'onRemove' | 'onStart' | 'onLater'> & { row: DayRow; index: number; autoFocus: boolean }

function Row({ row, index, busy, autoFocus, onRename, onMinutes, onRemove, onStart, onLater }: RowProps) {
  const [typed, setTyped] = useState(String(row.plannedMin))
  const [note, setNote] = useState('')
  const titleRef = useRef<HTMLInputElement>(null)
  const name = row.title.trim() || 'Sin título'
  const editable = row.status === 'pending' || row.status === 'later'
  const titleId = `bloque-${row.id}`

  useEffect(() => setTyped(String(row.plannedMin)), [row.plannedMin])
  useEffect(() => { if (autoFocus) titleRef.current?.focus() }, [autoFocus])

  const commitMinutes = () => {
    const value = Number(typed)
    if (!typed.trim() || Number.isNaN(value)) { setTyped(String(row.plannedMin)); return }
    setNote(minutesNote(value))
    onMinutes(row.id, value)
    setTyped(String(Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.round(value)))))
  }

  const onKey = (event: KeyboardEvent<HTMLInputElement>) => { if (event.key === 'Enter') commitMinutes() }

  return (
    <li className="fila" data-status={row.status}>
      <label className="etiqueta" htmlFor={titleId}>{`Bloque ${index + 1}`}</label>
      <div className="fila__cabecera">
        {editable
          ? <input ref={titleRef} id={titleId} className="fila__nombre fila__titulo" value={row.title} placeholder="Sin título" onChange={(event) => onRename(row.id, event.target.value)} autoComplete="off" />
          : <span id={titleId} className={row.status === 'done' ? 'fila__nombre fila__nombre--hecha' : 'fila__nombre'}>{name}</span>}
        {editable
          ? <div className="fila__minutos">
            <button className="boton-icono boton-icono--fila" type="button" aria-label={`Quitar 5 minutos a ${name}`} disabled={row.plannedMin <= MIN_MINUTES} onClick={() => { setNote(''); onMinutes(row.id, stepMinutes(row.plannedMin, -1)) }}><Icon name="menos" /></button>
            <label className="fila__valor">
              <input className="fila__numero" type="number" inputMode="numeric" min={MIN_MINUTES} max={MAX_MINUTES} value={typed} aria-label={`Minutos de ${name}`} onChange={(event) => setTyped(event.target.value)} onBlur={commitMinutes} onKeyDown={onKey} />
              <span aria-hidden="true"> min</span>
            </label>
            <button className="boton-icono boton-icono--fila" type="button" aria-label={`Añadir 5 minutos a ${name}`} disabled={row.plannedMin >= MAX_MINUTES} onClick={() => { setNote(''); onMinutes(row.id, stepMinutes(row.plannedMin, 1)) }}><Icon name="mas" /></button>
          </div>
          : <span className="fila__valor">{row.plannedMin} min</span>}
      </div>
      <p className="fila__estado">{statusText(row)}</p>
      <p className="fila__estado" aria-live="polite">{note}</p>
      {editable && <div className="fila__acciones">
        <button className="boton boton--oscuro" type="button" disabled={busy} aria-label={busy ? undefined : `Empezar ${name}`} onClick={() => onStart(row.id)}>{busy ? BUSY_TEXT : 'Empezar'}</button>
        <button className="boton" type="button" aria-label={`Más tarde ${name}`} onClick={() => onLater(row.id)}>Más tarde</button>
        <button className="boton" type="button" aria-label={`Quitar bloque ${name}`} onClick={() => onRemove(row.id)}>Quitar</button>
      </div>}
      {row.status === 'done' && <div className="fila__acciones">
        <button className="boton" type="button" aria-label={`Quitar bloque ${name}`} onClick={() => onRemove(row.id)}>Quitar</button>
      </div>}
    </li>
  )
}

// La lista de bloques del día. La propuesta de la IA se ve aquí como borrador editable.
export function TuDia({ rows, busy, thinking, undo, onAnother, onRename, onMinutes, onRemove, onUndo, onAdd, onStart, onLater }: TuDiaProps) {
  const [focusId, setFocusId] = useState<string | null>(null)
  const count = useRef(rows.length)

  // Tras «Añadir bloque», el foco va al título del bloque nuevo.
  useEffect(() => {
    if (rows.length > count.current && focusId === 'nuevo') setFocusId(rows[rows.length - 1].id)
    count.current = rows.length
  }, [rows, focusId])

  return (
    <section className="tarjeta" aria-labelledby="tu-dia">
      <div className="tu-dia__cabecera">
        <h2 id="tu-dia" className="etiqueta">Tu día</h2>
        <p className="etiqueta">Total: {formatDuration(totalMinutes(rows))}</p>
      </div>
      <p className="fila__estado" role="status">
        {undo && <>Has quitado «{undo.title || 'Sin título'}». <button className="texto-control" type="button" onClick={onUndo}>Deshacer</button></>}
      </p>
      <ul className="lista">
        {rows.map((row, index) => <Row key={row.id} row={row} index={index} busy={busy} autoFocus={focusId === row.id} onRename={onRename} onMinutes={onMinutes} onRemove={onRemove} onStart={onStart} onLater={onLater} />)}
      </ul>
      <div className="fila__acciones">
        <button className="boton" type="button" onClick={() => { setFocusId('nuevo'); onAdd() }}>Añadir bloque</button>
        <button className="boton" type="button" onClick={onAnother} disabled={thinking}>Otra propuesta</button>
      </div>
    </section>
  )
}
