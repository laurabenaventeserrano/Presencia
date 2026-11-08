import { ArrowRight, Minus, Pause, Play, Plus, X, type LucideIcon } from 'lucide-react'

// El repositorio de iconos: cada nombre de Presencia apunta a un icono de Lucide (lucide.dev).
// Es el único archivo que importa lucide-react; para añadir uno, se añade aquí.
const icons = {
  flecha: ArrowRight,
  cerrar: X,
  pausa: Pause,
  reanudar: Play,
  menos: Minus,
  mas: Plus,
} as const satisfies Record<string, LucideIcon>

export type IconName = keyof typeof icons

// Trazo de 1,5 px redondeado sobre una retícula de 24; el tamaño lo pone .icono con var(--icono).
export function Icon({ name }: { name: IconName }) {
  const Glyph = icons[name]
  return <Glyph className="icono" strokeWidth={1.5} aria-hidden="true" focusable="false" />
}
