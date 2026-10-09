import { BUSY_TEXT } from './Hoy'

type AvisoProps = {
  title: string
  busy: boolean
  onStart: () => void
  onClose: () => void
}

// Aviso suave cuando toca un bloque aplazado (A12). Nunca suena ni parpadea.
export function Aviso({ title, busy, onStart, onClose }: AvisoProps) {
  return (
    <div className="aviso" role="status">
      <p className="aviso__texto">Toca: {title}</p>
      <div className="acciones">
        <button className="boton boton--oscuro" type="button" disabled={busy} onClick={onStart}>{busy ? BUSY_TEXT : 'Empezar'}</button>
        <button className="texto-control" type="button" onClick={onClose}>Ahora no</button>
      </div>
    </div>
  )
}
