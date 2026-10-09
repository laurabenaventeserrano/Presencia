import { FormEvent, ReactNode, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ActiveBlock } from '../state/types'
import { clock } from '../time'
import { Icon } from './Icon'
import { Orb } from './Orb'
import './Hoy.css'

export const BUSY_TEXT = 'Ya hay un bloque en marcha'

type HoyProps = {
  active: ActiveBlock | null
  now: number
  onTimer: () => void
  onBreath: () => void
  onGoToBlock: () => void
  onAsk: (intent: string) => void
  onSuggest: () => void
  response: string
  thinking: boolean
  children?: ReactNode
}

export function Hoy({ active, now, onTimer, onBreath, onGoToBlock, onAsk, onSuggest, response, thinking, children }: HoyProps) {
  const [intent, setIntent] = useState('')
  const busy = active !== null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = intent.trim()
    if (!trimmed) return
    onAsk(trimmed)
    setIntent('')
  }
  const empty = !intent.trim()

  return (
    <section className="hoy" aria-label="Hoy">
      {active && <button className="franja" type="button" onClick={onGoToBlock} aria-label={`${active.title}, quedan ${clock(active, now)}. Volver al bloque`}>
        <span className="franja__titulo">{active.title}</span>
        <span className="franja__tiempo">{clock(active, now)}</span>
      </button>}

      <div className="caja-orbe caja-orbe--hoy">
        <Orb state={thinking || !empty ? 'escucha' : 'reposo'} size="hoy" />
      </div>

      <form className="formulario" onSubmit={handleSubmit}>
        <h1 id="hoy-titulo" className="hoy__titulo" tabIndex={-1}>
          <label htmlFor="intencion">¿Qué necesitas hacer hoy?</label>
        </h1>
        <div className="campo">
          <input
            id="intencion"
            className="campo__input"
            value={intent}
            onChange={(event) => setIntent(event.target.value)}
            autoComplete="off"
            aria-describedby={empty ? 'intencion-ayuda' : undefined}
          />
          <button className="boton-icono boton-icono--oscuro" type="submit" aria-label="Enviar" disabled={empty}><Icon name="flecha" /></button>
        </div>
        {empty && <p id="intencion-ayuda" className="campo-ayuda">
          Escribe qué necesitas hacer para enviarlo, o deja que te proponga uno. <button className="texto-control" type="button" onClick={onSuggest}>Sugiéreme un día</button>
        </p>}
      </form>

      {response && <p className="hoy__respuesta" aria-live="polite">{response}</p>}

      {children}

      <div className="acciones">
        <button className="boton" type="button" onClick={onTimer} disabled={busy}>Temporizador</button>
        <button className="boton" type="button" onClick={onBreath} disabled={busy}>Respirar</button>
      </div>
      {busy && <p className="nota">
        {BUSY_TEXT} · <button className="texto-control" type="button" onClick={onGoToBlock}>Ir al bloque</button>
      </p>}

      <nav className="vistas" aria-label="Secciones">
        <Link className="enlace" to="/dias">Días</Link>
        <Link className="enlace" to="/ajustes">Ajustes</Link>
      </nav>
    </section>
  )
}
