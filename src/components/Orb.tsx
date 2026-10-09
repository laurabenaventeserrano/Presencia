import type { OrbState } from '../ui/logic'
import './Orb.css'

// Tres manchas por estado; los colores viven en tokens.css como --orbe-*.
const palette: Record<OrbState, readonly [string, string, string]> = {
  reposo: ['coral', 'ambar', 'melocoton'],
  escucha: ['rosa', 'lila', 'cielo'],
  foco: ['menta', 'cielo', 'menta'],
  pausa: ['cielo', 'lila', 'cielo'],
  hecho: ['menta', 'ambar', 'melocoton'],
  respirar: ['melocoton', 'lila', 'rosa'],
}

type OrbProps = {
  state: OrbState
  size: 'hoy' | 'curso' | 'resp'
  // La deriva completa solo con el timer en marcha; si no, casi quieto.
  active?: boolean
  // Respirar: el orbe se detiene en pausa y arranca su ciclo en el punto que toca.
  paused?: boolean
  cycleOffsetMs?: number
}

const labels: Record<OrbState, string> = {
  reposo: 'Orbe en reposo',
  escucha: 'Orbe escuchando',
  foco: 'Orbe en foco',
  pausa: 'Orbe en pausa',
  hecho: 'Orbe: hecho',
  respirar: 'Orbe respirando',
}

export function Orb({ state, size, active = false, paused = false, cycleOffsetMs }: OrbProps) {
  const motion = state === 'respirar' ? 'respira' : active ? 'deriva' : 'quieto'
  const style = cycleOffsetMs === undefined ? undefined : { animationDelay: `-${cycleOffsetMs}ms` }
  return (
    <div className={`orbe orbe--${size}`} data-motion={motion} data-paused={paused || undefined} style={style} role="img" aria-label={labels[state]}>
      <div className="orbe__luz">
        {palette[state].map((color, index) => (
          <span key={index} className="orbe__mancha" style={{ background: `var(--orbe-${color})` }} />
        ))}
      </div>
    </div>
  )
}
