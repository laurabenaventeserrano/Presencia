import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createMockProvider } from '../ai/mock-provider'
import { usePlanStream } from '../ai/usePlanStream'
import type { Task } from '../store'
import { hoyOrb, MAX_MINUTES, MIN_MINUTES, ProposalRow, proposalRows, stepMinutes } from '../ui/logic'
import { Icon } from './Icon'
import { Orb } from './Orb'
import './Hoy.css'

type HoyProps = {
  device: 'ordenador' | 'movil'
  tasks: Task[]
  doneTaskIds: ReadonlySet<string>
  busy: boolean
  onStart: (row: ProposalRow) => void
  onSave: (title: string) => void
  onStartTask: (taskId: string) => void
}

const BUSY_LABEL = 'Ya hay un bloque en marcha'

export function Hoy({ device, tasks, doneTaskIds, busy, onStart, onSave, onStartTask }: HoyProps) {
  const provider = useMemo(() => createMockProvider(), [])
  const { text, proposedBlocks, status, start, cancel } = usePlanStream(provider)
  const [intention, setIntention] = useState('')
  const [rows, setRows] = useState<ProposalRow[]>([])
  const isStreaming = status === 'streaming'

  // Cada respuesta nueva de la IA sustituye el borrador anterior.
  useEffect(() => setRows(proposalRows(proposedBlocks, tasks)), [proposedBlocks])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = intention.trim()
    if (!trimmed || isStreaming) return
    // La IA solo planifica con lo que aún está pendiente.
    void start(trimmed, tasks.filter((task) => !task.done))
    setIntention('')
  }

  const updateMinutes = (key: string, direction: 1 | -1) =>
    setRows((current) => current.map((row) => row.key === key ? { ...row, minutes: stepMinutes(row.minutes, direction) } : row))

  const removeRow = (key: string) => setRows((current) => current.filter((row) => row.key !== key))

  return (
    <section className="hoy" aria-label="Hoy">
      <div className="caja-orbe caja-orbe--hoy">
        <Orb state={hoyOrb(intention, isStreaming)} size="hoy" />
      </div>

      <h1 className="hoy__titulo">¿Qué quieres hacer hoy?</h1>

      <p className="hoy__respuesta" aria-live="polite">
        {status === 'idle' ? 'Escribe algo y te propongo cómo repartirlo.' : text}
        {status === 'cancelled' && ' · Detenido'}
      </p>

      <form className="campo" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="intencion">Escribe lo que quieres hacer</label>
        <input
          id="intencion"
          className="campo__input"
          value={intention}
          onChange={(event) => setIntention(event.target.value)}
          placeholder="Escribe lo que quieres hacer"
          autoComplete="off"
          disabled={isStreaming}
        />
        {isStreaming
          ? <button className="boton-icono" type="button" onClick={cancel} aria-label="Parar"><Icon name="cerrar" /></button>
          : <button className="boton-icono boton-icono--oscuro" type="submit" aria-label="Enviar" disabled={!intention.trim()}><Icon name="flecha" /></button>}
      </form>

      <div className="tarjeta">
        <h2 className="etiqueta">Propuesta</h2>
        {rows.length === 0
          ? <p className="vacio">Nada propuesto todavía.</p>
          : <ul className="lista">
            {rows.map((row) => <li className="fila" key={row.key}>
              <div className="fila__cabecera">
                <span className="fila__nombre">{row.title}</span>
                <div className="fila__minutos">
                  <button className="boton-icono boton-icono--fila" type="button" aria-label="Quitar 5 minutos" disabled={row.minutes <= MIN_MINUTES} onClick={() => updateMinutes(row.key, -1)}><Icon name="menos" /></button>
                  <span className="fila__valor">{row.minutes} min</span>
                  <button className="boton-icono boton-icono--fila" type="button" aria-label="Añadir 5 minutos" disabled={row.minutes >= MAX_MINUTES} onClick={() => updateMinutes(row.key, 1)}><Icon name="mas" /></button>
                </div>
              </div>
              <div className="fila__acciones">
                <button className="boton boton--oscuro" type="button" disabled={busy} onClick={() => { onStart(row); removeRow(row.key) }}>{busy ? BUSY_LABEL : 'Empezar'}</button>
                <button className="boton" type="button" onClick={() => { onSave(row.title); removeRow(row.key) }}>Guardar</button>
              </div>
            </li>)}
          </ul>}

        <hr className="separador" />

        <h2 className="etiqueta">Tareas</h2>
        {tasks.length === 0
          ? <p className="vacio">No hay tareas guardadas.</p>
          : <ul className="lista">
            {tasks.map((task) => {
              const done = doneTaskIds.has(task.id)
              return <li className="fila" key={task.id}>
                <span className={done ? 'fila__nombre fila__nombre--hecha' : 'fila__nombre'}>{task.title}</span>
                <div className="fila__acciones">
                  <button className="boton boton--oscuro" type="button" disabled={busy} onClick={() => onStartTask(task.id)}>{busy ? BUSY_LABEL : 'Empezar'}</button>
                </div>
              </li>
            })}
          </ul>}
      </div>

      <nav className="vistas" aria-label="Vistas">
        {device === 'ordenador' ? <Link className="enlace" to="/m">Móvil</Link> : <Link className="enlace" to="/app">Ordenador</Link>}
        <Link className="enlace" to="/watch">Reloj</Link>
      </nav>
    </section>
  )
}
