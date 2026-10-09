import { useEffect, useRef, useState } from 'react'
import { actions } from '../actions'
import { useAppStore } from '../store'
import { tabTitle } from '../time'
import { useNow } from '../hooks/useNow'
import { EnCurso } from './EnCurso'
import { Hoy } from './Hoy'
import { Temporizador } from './Temporizador'

type View = 'hoy' | 'temporizador' | 'curso'

// Casi todo ocurre en esta página: Hoy, el temporizador y el bloque en curso.
export function Inicio() {
  const active = useAppStore((state) => state.active)
  const [view, setView] = useState<View>(active ? 'curso' : 'hoy')
  const now = useNow(active?.status === 'running')
  const firstRender = useRef(true)

  // Sin bloque activo, En curso no tiene sentido.
  const shown: View = view === 'curso' && !active ? 'hoy' : view

  // Al cambiar de pantalla, el foco va a su título, para no perderse con teclado o lector.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    document.querySelector<HTMLElement>('main h1')?.focus()
  }, [shown])

  // El tiempo restante en el título de la pestaña (B9).
  useEffect(() => { document.title = tabTitle(active, now) }, [active, now])

  if (shown === 'curso' && active) {
    return <EnCurso
      active={active}
      now={now}
      onPause={actions.pause}
      onResume={actions.resume}
      onFinish={() => { actions.finish(); setView('hoy') }}
      onHoy={() => setView('hoy')}
    />
  }

  if (shown === 'temporizador') {
    return <Temporizador onBack={() => setView('hoy')} onStart={(input) => { actions.startTimer(input); setView('curso') }} />
  }

  return <Hoy
    active={active}
    now={now}
    onTimer={() => setView('temporizador')}
    onBreath={() => undefined}
    onGoToBlock={() => setView('curso')}
  />
}
