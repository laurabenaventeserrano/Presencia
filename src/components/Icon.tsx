// Iconos dibujados a mano: trazo de 1,5 px redondeado sobre una retícula de 24.
const paths = {
  flecha: 'M5 12h14M13 6l6 6-6 6',
  cerrar: 'M6 6l12 12M18 6L6 18',
  pausa: 'M9 6v12M15 6v12',
  reanudar: 'M8 5l11 7-11 7z',
  menos: 'M6 12h12',
  mas: 'M12 6v12M6 12h12',
} as const

export type IconName = keyof typeof paths

export function Icon({ name }: { name: IconName }) {
  return (
    <svg className="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}
