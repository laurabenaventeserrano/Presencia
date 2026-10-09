import { useState } from 'react'
import type { ActiveBlock } from '../state/types'
import { BREATH_MINUTES, breathCycleOffsetMs, breathPhase } from '../time/breath'
import { clock, isEnded, workedMs } from '../time'
import { Icon } from './Icon'
import { Orb } from './Orb'
import './Foco.css'

type ElegirProps = {
  onStart: (minutes: number) => void
  onBack: () => void
}

// Elegir duración y empezar (R1).
export function RespirarElegir({ onStart, onBack }: ElegirProps) {
  const [minutes, setMinutes] = useState(1)
  return (
    <section className="pantalla" aria-labelledby="respirar-titulo">
      <button className="texto-control pantalla__volver" type="button" onClick={onBack}>Hoy</button>
      <div className="caja-orbe caja-orbe--curso">
        <Orb state="respirar" size="curso" paused />
      </div>
      <h1 id="respirar-titulo" className="pantalla__titulo" tabIndex={-1}>Respirar</h1>
      <div className="opciones" role="group" aria-label="Duración">
        {BREATH_MINUTES.map((option) => <button key={option} className="boton" type="button" aria-pressed={minutes === option} onClick={() => setMinutes(option)}>{option} min</button>)}
      </div>
      <button className="boton boton--oscuro" type="button" onClick={() => onStart(minutes)}>Empezar</button>
    </section>
  )
}

type GuiaProps = {
  active: ActiveBlock
  now: number
  onPause: () => void
  onResume: () => void
  onFinish: () => void
  onHoy: () => void
}

// La respiración guiada (R2–R4). Pausar y Terminar responden al instante, sin confirmación.
export function RespirarGuia({ active, now, onPause, onResume, onFinish, onHoy }: GuiaProps) {
  const ended = isEnded(active, now)
  const running = active.status === 'running'
  const elapsed = workedMs(active, now)

  return (
    <section className="pantalla" aria-labelledby="guia-titulo">
      <button className="texto-control pantalla__volver" type="button" onClick={onHoy}>Hoy</button>
      <div className="caja-orbe caja-orbe--resp">
        <Orb state={ended ? 'hecho' : 'respirar'} size="resp" paused={!running || ended} cycleOffsetMs={breathCycleOffsetMs(elapsed)} />
      </div>
      <h1 id="guia-titulo" className="sr-only" tabIndex={-1}>Respirar</h1>
      <p className="foco__respiracion" aria-live="polite">{ended ? 'Hecho' : running ? breathPhase(elapsed) : 'En pausa'}</p>
      <p className="curso__bloque">{clock(active, now)}</p>
      {ended
        ? <button className="boton boton--oscuro" type="button" onClick={() => onFinish()}>Volver a Hoy</button>
        : <div className="curso__controles">
          <button className="boton-icono" type="button" aria-label="Terminar" onClick={() => onFinish()}><Icon name="cerrar" /></button>
          <button className="boton-icono" type="button" aria-label={running ? 'Pausar' : 'Reanudar'} onClick={() => (running ? onPause() : onResume())}>
            <Icon name={running ? 'pausa' : 'reanudar'} />
          </button>
        </div>}
    </section>
  )
}
