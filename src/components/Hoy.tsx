import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Task } from '../store'
import { formatTime, hoyOrb, MAX_MINUTES, MIN_MINUTES, ProposalRow, rowReady } from '../ui/logic'
import type { Proposal } from '../ui/useProposal'
import { Icon } from './Icon'
import { Orb } from './Orb'
import './Hoy.css'

type CurrentBlock = { title: string; seconds: number }

type HoyProps = {
  device: 'ordenador' | 'movil'
  tasks: Task[]
  proposal: Proposal
  // El bloque en marcha o en pausa, si lo hay: Hoy lo recuerda arriba y bloquea Empezar.
  current?: CurrentBlock
  onCurrent: () => void
  onStart: (row: ProposalRow) => void
  onSave: (row: ProposalRow) => void
  onStartTask: (task: Task) => void
  onToggleDone: (taskId: string) => void
  onDelete: (taskId: string) => void
  onLoadSamples: () => void
}

const BUSY_LABEL = 'Ya hay un bloque en marcha'

export function Hoy({ device, tasks, proposal, current, onCurrent, onStart, onSave, onStartTask, onToggleDone, onDelete, onLoadSamples }: HoyProps) {
  const { text, status, rows, ask, cancel, stepRow, renameRow, removeRow } = proposal
  const [intention, setIntention] = useState('')
  const isStreaming = status === 'streaming'
  const busy = current !== undefined

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = intention.trim()
    if (!trimmed || isStreaming) return
    ask(trimmed)
    setIntention('')
  }

  // Lo que sale del borrador va sin espacios sobrantes.
  const cleanRow = (row: ProposalRow): ProposalRow => ({ ...row, title: row.title.trim() })

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
        {current && <>
          <button className="en-marcha" type="button" onClick={onCurrent} aria-label={`${current.title}, quedan ${formatTime(current.seconds)}. Volver al bloque`}>
            <span className="en-marcha__titulo">{current.title}</span>
            <span className="en-marcha__tiempo">{formatTime(current.seconds)}</span>
          </button>
          <hr className="separador" />
        </>}
        <h2 className="etiqueta">Propuesta</h2>
        {rows.length === 0
          ? <p className="vacio">Nada propuesto todavía.</p>
          : <ul className="lista">
            {rows.map((row) => <li className="fila" key={row.key}>
              <div className="fila__cabecera">
                <input
                  className="fila__nombre fila__titulo"
                  value={row.title}
                  onChange={(event) => renameRow(row.key, event.target.value)}
                  aria-label="Título del bloque"
                  autoComplete="off"
                />
                <div className="fila__minutos">
                  <button className="boton-icono boton-icono--fila" type="button" aria-label="Quitar 5 minutos" disabled={row.minutes <= MIN_MINUTES} onClick={() => stepRow(row.key, -1)}><Icon name="menos" /></button>
                  <span className="fila__valor">{row.minutes} min</span>
                  <button className="boton-icono boton-icono--fila" type="button" aria-label="Añadir 5 minutos" disabled={row.minutes >= MAX_MINUTES} onClick={() => stepRow(row.key, 1)}><Icon name="mas" /></button>
                </div>
              </div>
              <div className="fila__acciones">
                <button className="boton boton--oscuro" type="button" disabled={busy || !rowReady(row)} onClick={() => { onStart(cleanRow(row)); removeRow(row.key) }}>{busy ? BUSY_LABEL : 'Empezar'}</button>
                <button className="boton" type="button" disabled={!rowReady(row)} onClick={() => { onSave(cleanRow(row)); removeRow(row.key) }}>Guardar</button>
              </div>
            </li>)}
          </ul>}

        <hr className="separador" />

        <h2 className="etiqueta">Tareas</h2>
        {tasks.length === 0
          ? <div className="fila">
            <p className="vacio">No hay tareas guardadas.</p>
            <div className="fila__acciones">
              <button className="boton" type="button" onClick={onLoadSamples}>Cargar tareas de ejemplo</button>
            </div>
          </div>
          : <ul className="lista">
            {tasks.map((task) => <li className="fila" key={task.id}>
              <span className={task.done ? 'fila__nombre fila__nombre--hecha' : 'fila__nombre'}>{task.title}</span>
              <div className="fila__acciones">
                <button className="boton boton--oscuro" type="button" disabled={busy} onClick={() => onStartTask(task)}>{busy ? BUSY_LABEL : 'Empezar'}</button>
                <button className="boton" type="button" aria-pressed={task.done} onClick={() => onToggleDone(task.id)}>Hecha</button>
                <button className="boton" type="button" onClick={() => onDelete(task.id)}>Borrar</button>
              </div>
            </li>)}
          </ul>}
      </div>

      <nav className="vistas" aria-label="Vistas">
        {device === 'ordenador' ? <Link className="enlace" to="/m">Móvil</Link> : <Link className="enlace" to="/app">Ordenador</Link>}
        <Link className="enlace" to="/watch">Reloj</Link>
      </nav>
    </section>
  )
}
