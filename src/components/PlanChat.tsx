import { FormEvent, useMemo, useState } from 'react'
import { createMockProvider } from '../ai/mock-provider'
import type { BlockKind } from '../ai/types'
import { usePlanStream } from '../ai/usePlanStream'
import { seedTasks } from '../seed/tasks'
import './PlanChat.css'

const kindLabels: Record<BlockKind, string> = {
  focus: 'Foco',
  break: 'Pausa',
  breathe: 'Respirar',
  meditate: 'Meditar',
}

export function PlanChat() {
  const provider = useMemo(() => createMockProvider(), [])
  const { text, proposedBlocks, status, start, cancel } = usePlanStream(provider)
  const [intention, setIntention] = useState('')
  const isStreaming = status === 'streaming'

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = intention.trim()
    if (!trimmed || isStreaming) return
    void start(trimmed, seedTasks)
  }

  return (
    <section className="plan-chat" aria-label="Planificar con IA">
      <p className="eyebrow">PLAN DEL DÍA</p>
      <h2 className="plan-chat__title">¿Qué quieres conseguir hoy?</h2>

      <form className="plan-chat__form" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="plan-intention">Intención</label>
        <input
          id="plan-intention"
          className="plan-chat__input"
          value={intention}
          onChange={(event) => setIntention(event.target.value)}
          placeholder="Por ejemplo: cerrar el diseño antes de comer"
          disabled={isStreaming}
        />
        {isStreaming
          ? <button className="secondary-button" type="button" onClick={cancel}>Parar</button>
          : <button className="primary-button" type="submit" disabled={!intention.trim()}>Enviar</button>}
      </form>

      {status !== 'idle' && <p className="plan-chat__message" aria-live="polite">
        {text}
        {status === 'cancelled' && <span className="plan-chat__status"> · Detenido</span>}
      </p>}

      {proposedBlocks.length > 0 && <ol className="plan-chat__blocks">
        {proposedBlocks.map((block, index) => <li className="plan-chat__block" key={index}>
          <span>{kindLabels[block.kind]}</span>
          <span>{block.minutes} min</span>
        </li>)}
      </ol>}
    </section>
  )
}
