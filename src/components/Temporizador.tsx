import { FormEvent, useState } from 'react'
import { MAX_MINUTES } from '../ui/logic'

const PRESETS = [15, 25, 50]

type TemporizadorProps = {
  onStart: (input: { title: string; minutes: number }) => void
  onBack: () => void
}

// Temporizador sin el chat: minutos, título opcional y Play (B1).
export function Temporizador({ onStart, onBack }: TemporizadorProps) {
  const [minutes, setMinutes] = useState(25)
  const [title, setTitle] = useState('')
  const valid = Number.isInteger(minutes) && minutes >= 1 && minutes <= MAX_MINUTES

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (valid) onStart({ title, minutes })
  }

  return (
    <section className="pantalla" aria-labelledby="temporizador-titulo">
      <button className="texto-control pantalla__volver" type="button" onClick={onBack}>Hoy</button>
      <h1 id="temporizador-titulo" className="pantalla__titulo" tabIndex={-1}>Temporizador</h1>
      <form className="formulario" onSubmit={handleSubmit}>
        <div className="opciones" role="group" aria-label="Duración">
          {PRESETS.map((preset) => <button key={preset} className="boton" type="button" aria-pressed={minutes === preset} onClick={() => setMinutes(preset)}>{preset} min</button>)}
        </div>
        <label className="campo-etiqueta">
          Minutos
          <input className="campo-simple" type="number" inputMode="numeric" min={1} max={MAX_MINUTES} value={Number.isNaN(minutes) ? '' : minutes} onChange={(event) => setMinutes(event.target.valueAsNumber)} />
        </label>
        <label className="campo-etiqueta">
          Título (opcional)
          <input className="campo-simple" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Sin título" autoComplete="off" />
        </label>
        <button className="boton boton--oscuro" type="submit" disabled={!valid}>Play</button>
      </form>
    </section>
  )
}
