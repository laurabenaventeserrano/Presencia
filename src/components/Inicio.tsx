import { useEffect, useMemo, useRef, useState } from 'react'
import { actions } from '../actions'
import type { DraftRow } from '../actions/plan'
import { createMockProvider } from '../ai/mock-provider'
import { usePlanStream } from '../ai/usePlanStream'
import { useAppStore } from '../store'
import { localDate, tabTitle } from '../time'
import { useNow } from '../hooks/useNow'
import { EnCurso } from './EnCurso'
import { Hoy } from './Hoy'
import { RespirarElegir, RespirarGuia } from './Respirar'
import { Temporizador } from './Temporizador'
import { TuDia, type Undo } from './TuDia'
import type { PlanItem } from '../state/types'

type View = 'hoy' | 'temporizador' | 'respirar' | 'curso'

// Casi todo ocurre en esta página: Hoy, el temporizador y el bloque en curso.
export function Inicio() {
  const active = useAppStore((state) => state.active)
  const plan = useAppStore((state) => state.plan)
  const [view, setView] = useState<View>(active ? 'curso' : 'hoy')
  const now = useNow(active?.status === 'running')
  const firstRender = useRef(true)

  // La propuesta de la IA es un borrador: vive aquí hasta el primer gesto de la persona sobre ella.
  const provider = useMemo(() => createMockProvider(), [])
  const [request, setRequest] = useState<{ intent: string; batch: number } | null>(null)
  const [draft, setDraft] = useState<DraftRow[] | null>(null)
  const stream = usePlanStream(provider, (args) => setDraft(args.items.map((item) => ({ ...item, id: crypto.randomUUID() }))))

  const ask = (intent: string, batch = 0) => {
    setRequest({ intent, batch })
    void stream.ask({ intent, date: localDate(Date.now()), batch })
  }
  const another = () => {
    const base = request ?? (plan ? { intent: plan.intent, batch: plan.batch } : { intent: '', batch: 0 })
    ask(base.intent, base.batch + 1)
  }
  // El primer gesto sobre la propuesta la acepta: pasa a ser el plan de hoy.
  const accept = () => {
    if (!draft) return
    actions.createPlan({ intent: request?.intent ?? '', batch: request?.batch ?? 0, items: draft })
    setDraft(null)
  }

  // «Quitar» con «Deshacer» durante 8 segundos (A8).
  const [undo, setUndo] = useState<(Undo & { item: PlanItem; index: number }) | null>(null)
  useEffect(() => {
    if (!undo) return
    const timeout = window.setTimeout(() => setUndo(null), 8_000)
    return () => window.clearTimeout(timeout)
  }, [undo])

  const edit = {
    onRename: (id: string, title: string) => { accept(); actions.updateItem(id, { title }) },
    onMinutes: (id: string, minutes: number) => { accept(); actions.updateItem(id, { plannedMin: minutes }) },
    onRemove: (id: string) => {
      accept()
      const items = useAppStore.getState().plan?.items ?? []
      const index = items.findIndex((item) => item.id === id)
      if (index < 0) return
      setUndo({ title: items[index].title, item: items[index], index })
      actions.removeItem(id)
    },
    onUndo: () => { if (undo) actions.addItem({ item: undo.item, index: undo.index }); setUndo(null) },
    onAdd: () => { accept(); actions.addItem() },
    onStart: (id: string) => { accept(); actions.startItem(id); if (useAppStore.getState().active) setView('curso') },
  }

  const rows = draft?.map((item) => ({ ...item, status: 'pending' as const })) ?? plan?.items ?? []

  // Sin bloque activo, En curso no tiene sentido.
  const shown: View = view === 'curso' && !active ? 'hoy' : view

  // Al cambiar de pantalla, el foco va a su título, para no perderse con teclado o lector.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    document.querySelector<HTMLElement>('main h1')?.focus()
  }, [shown])

  // El tiempo restante en el título de la pestaña (B9).
  useEffect(() => { document.title = tabTitle(active, now) }, [active, now])

  if (shown === 'curso' && active?.kind === 'breathe') {
    return <RespirarGuia
      active={active}
      now={now}
      onPause={actions.pause}
      onResume={actions.resume}
      onFinish={() => { actions.finish(); setView('hoy') }}
      onHoy={() => setView('hoy')}
    />
  }

  if (shown === 'respirar') {
    return <RespirarElegir onBack={() => setView('hoy')} onStart={(minutes) => { actions.startBreathing({ minutes }); setView('curso') }} />
  }

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
    onBreath={() => setView('respirar')}
    onGoToBlock={() => setView('curso')}
    onAsk={(intent) => ask(intent)}
    onSuggest={() => ask('')}
    response={stream.text}
    thinking={stream.status === 'streaming'}
  >
    {(rows.length > 0 || undo) && <TuDia rows={rows} busy={active !== null} thinking={stream.status === 'streaming'} undo={undo} onAnother={another} {...edit} />}
  </Hoy>
}
