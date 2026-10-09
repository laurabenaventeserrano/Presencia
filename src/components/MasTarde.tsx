import { Dialogo } from './Dialogo'

export const LATER_OPTIONS = [
  { minutes: 15, label: '15 minutos' },
  { minutes: 30, label: '30 minutos' },
  { minutes: 60, label: '1 hora' },
]

type MasTardeProps = {
  title: string | null // el bloque que se aplaza; null = cerrado
  onChoose: (minutes: number) => void
  onClose: () => void
}

// Aplazar un bloque a más tarde (A12, B4).
export function MasTarde({ title, onChoose, onClose }: MasTardeProps) {
  return (
    <Dialogo open={title !== null} title={`¿Cuándo retomas «${title ?? ''}»?`} onClose={onClose}>
      <div className="acciones">
        {LATER_OPTIONS.map((option) => <button key={option.minutes} className="boton" type="button" onClick={() => onChoose(option.minutes)}>{option.label}</button>)}
      </div>
      <button className="texto-control" type="button" onClick={onClose}>Cancelar</button>
    </Dialogo>
  )
}
