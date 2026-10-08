import { useEffect, useState } from 'react'
import { Breath, BREATH_CYCLES, FocusPhase, focusOrb, formatTime, nextBreath } from '../ui/logic'
import { Icon } from './Icon'
import { Orb } from './Orb'
import './Foco.css'

type EnCursoProps = {
  title: string
  seconds: number
  phase: FocusPhase
  closeLabel: string
  onClose?: () => void
  onToggle?: () => void
  onBreathe: () => void
}

const toggleLabel: Record<FocusPhase, string> = {
  'listo': 'Empezar',
  'en-marcha': 'Pausar',
  'en-pausa': 'Reanudar',
  'hecho': 'Reanudar',
}

export function EnCurso({ title, seconds, phase, closeLabel, onClose, onToggle, onBreathe }: EnCursoProps) {
  return (
    <section className="foco" aria-label="En curso">
      <div className="caja-orbe caja-orbe--curso">
        <Orb state={focusOrb(phase)} size="curso" active={phase === 'en-marcha'} />
      </div>
      <p className="foco__bloque">{title}</p>
      <p className="foco__tiempo" role="timer" aria-live="off">{formatTime(seconds)}</p>
      <div className="foco__controles">
        {onClose && <button className="boton-icono" type="button" aria-label={closeLabel} onClick={onClose}><Icon name="cerrar" /></button>}
        {onToggle && <button className="boton-icono" type="button" aria-label={toggleLabel[phase]} onClick={onToggle}>
          <Icon name={phase === 'en-marcha' ? 'pausa' : 'reanudar'} />
        </button>}
      </div>
      <button className="enlace" type="button" onClick={onBreathe}>Respirar</button>
    </section>
  )
}

const BREATH_MS = 2500

export function Respirar({ onClose }: { onClose: () => void }) {
  const [breath, setBreath] = useState<Breath>({ phase: 'inspira', cycles: 0 })

  useEffect(() => {
    const interval = window.setInterval(() => setBreath(nextBreath), BREATH_MS)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <section className="foco" aria-label="Respirar">
      <button className="boton-icono foco__cerrar" type="button" aria-label="Volver" onClick={onClose}><Icon name="cerrar" /></button>
      <div className="caja-orbe caja-orbe--resp">
        <Orb state="respirar" size="resp" />
      </div>
      <p className="foco__respiracion" aria-live="polite">{breath.phase === 'inspira' ? 'Inspira' : 'Espira'}</p>
      <div className="puntos" role="img" aria-label={`${breath.cycles} de ${BREATH_CYCLES} ciclos`}>
        {Array.from({ length: BREATH_CYCLES }, (_, index) => <span key={index} className={index < breath.cycles ? 'punto punto--on' : 'punto'} />)}
      </div>
    </section>
  )
}
