import { useEffect, useState } from 'react'
import type { ActiveBlock } from '../state/types'
import { clock, isEnded, remainingMs } from '../time'
import { Dialogo } from './Dialogo'
import { Icon } from './Icon'
import { Orb } from './Orb'

type EnCursoProps = {
  active: ActiveBlock
  now: number
  onPause: () => void
  onResume: () => void
  onFinish: () => void
  onHoy: () => void
}

// Lo que oye un lector de pantalla: cada minuto y al terminar, nunca cada segundo (B11).
export const announcement = (active: ActiveBlock, now: number) => {
  if (isEnded(active, now)) return 'Tiempo terminado'
  const minutes = Math.ceil(remainingMs(active, now) / 60_000)
  return minutes === 1 ? 'Queda 1 minuto' : `Quedan ${minutes} minutos`
}

export function EnCurso({ active, now, onPause, onResume, onFinish, onHoy }: EnCursoProps) {
  const [confirming, setConfirming] = useState(false)
  const ended = isEnded(active, now)
  const running = active.status === 'running'
  const toggle = running ? onPause : onResume

  // Espacio pausa y reanuda (B10). Si el foco está en un control, ese control ya responde.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== ' ' || confirming || ended) return
      if (event.target instanceof HTMLElement && event.target.closest('button, input, a, textarea, select')) return
      event.preventDefault()
      toggle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle, confirming, ended])

  return (
    <section className="pantalla" aria-labelledby="curso-titulo">
      <button className="texto-control pantalla__volver" type="button" onClick={onHoy}>Hoy</button>
      <div className="caja-orbe caja-orbe--curso">
        <Orb state={ended ? 'hecho' : running ? 'foco' : 'pausa'} size="curso" active={running && !ended} />
      </div>
      <h1 id="curso-titulo" className="curso__bloque" tabIndex={-1}>{active.title}</h1>
      <p className="curso__tiempo" aria-hidden="true">{clock(active, now)}</p>
      <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement(active, now)}</p>

      {ended
        ? <div className="curso__controles">
          <p className="pantalla__texto">Se acabó el tiempo.</p>
          <button className="boton boton--oscuro" type="button" onClick={() => onFinish()}>Terminar</button>
        </div>
        : <div className="curso__controles">
          <button className="boton-icono" type="button" aria-label="Terminar" onClick={() => setConfirming(true)}><Icon name="cerrar" /></button>
          <button className="boton-icono" type="button" aria-label={running ? 'Pausar' : 'Reanudar'} onClick={() => toggle()}>
            <Icon name={running ? 'pausa' : 'reanudar'} />
          </button>
        </div>}

      <Dialogo open={confirming} title="¿Terminar este bloque?" onClose={() => setConfirming(false)}>
        <div className="acciones">
          <button className="boton boton--oscuro" type="button" onClick={() => { setConfirming(false); onFinish() }}>Terminar</button>
          <button className="boton" type="button" onClick={() => setConfirming(false)}>Seguir</button>
        </div>
      </Dialogo>
    </section>
  )
}
