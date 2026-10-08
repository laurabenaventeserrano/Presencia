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
}

export function Orb({ state, size, active = false }: OrbProps) {
  const motion = state === 'respirar' ? 'respira' : active ? 'deriva' : 'quieto'
  return (
    <div className={`orbe orbe--${size}`} data-motion={motion} role="img" aria-label="Orbe">
      <div className="orbe__luz">
        {palette[state].map((color, index) => (
          <span key={index} className="orbe__mancha" style={{ background: `var(--orbe-${color})` }} />
        ))}
      </div>
    </div>
  )
}
