import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { actions } from '../actions'
import type { DraftRow } from '../actions/plan'
import { createMockProvider } from '../ai/mock-provider'
import { usePlanStream } from '../ai/usePlanStream'
import { useNow } from '../hooks/useNow'
import type { PlanItem } from '../state/types'
import { useAppStore } from '../store'
import { localDate, tabTitle } from '../time'
import { Aviso } from './Aviso'
import { EnCurso } from './EnCurso'
import { Hoy } from './Hoy'
import { MasTarde } from './MasTarde'
import { RespirarElegir, RespirarGuia } from './Respirar'
import { Temporizador } from './Temporizador'
import { TuDia, type Undo } from './TuDia'

type View = 'hoy' | 'temporizador' | 'respirar' | 'curso'
type Postpone = { title: string; itemId?: string } // sin itemId: el bloque en marcha

const msUntilMidnight = (now: number) => {
  const next = new Date(now)
  next.setHours(24, 0, 0, 0)
  return next.getTime() - now
}

// Casi todo ocurre en esta página: Hoy y Tu día, el temporizador, Respirar y el bloque en curso.
export function Inicio() {
  const active = useAppStore((state) => state.active)
  const plan = useAppStore((state) => state.plan)
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

  // El plan es de un solo día (A13): a medianoche, el de ayer desaparece.
  const [today, setToday] = useState(() => localDate(Date.now()))
  useEffect(() => {
    const timeout = window.setTimeout(() => { actions.rollDay(); setToday(localDate(Date.now())) }, msUntilMidnight(Date.now()) + 50)
    return () => window.clearTimeout(timeout)
  }, [today])

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

  // «Más tarde» (A12, B4).
  const [postpone, setPostpone] = useState<Postpone | null>(null)
  const choosePostpone = (minutes: number) => {
    if (postpone?.itemId) actions.postponeItem(postpone.itemId, minutes)
    else { actions.postponeActive(minutes); setView('hoy') }
    setPostpone(null)
  }

  // Aviso suave cuando llega la hora de un bloque aplazado (A12). Solo con la pestaña abierta.
  const [clock, setClock] = useState(() => Date.now())
  const [dismissed, setDismissed] = useState<string[]>([])
  const nextLater = plan?.items
    .filter((item) => item.status === 'later' && item.laterUntil && !dismissed.includes(item.id))
    .map((item) => new Date(item.laterUntil ?? 0).getTime())
    .sort((a, b) => a - b)[0]
  useEffect(() => {
    if (nextLater === undefined) return
    const timeout = window.setTimeout(() => setClock(Date.now()), Math.max(0, nextLater - Date.now()) + 50)
    return () => window.clearTimeout(timeout)
  }, [nextLater])
  const current = Math.max(clock, now)
  const due = plan?.items.find((item) => item.status === 'later' && item.laterUntil
    && new Date(item.laterUntil).getTime() <= current && !dismissed.includes(item.id))

  const startItem = (id: string) => {
    accept()
    actions.startItem(id)
    if (useAppStore.getState().active) setView('curso')
  }

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
    onStart: startItem,
    onLater: (id: string) => {
      accept()
      const item = useAppStore.getState().plan?.items.find((candidate) => candidate.id === id)
      if (item) setPostpone({ title: item.title || 'Sin título', itemId: id })
    },
  }

  const rows = draft?.map((item) => ({ ...item, status: 'pending' as const })) ?? plan?.items ?? []

  const overlays: ReactNode = <>
    <MasTarde title={postpone?.title ?? null} onChoose={choosePostpone} onClose={() => setPostpone(null)} />
    {due && <Aviso
      title={due.title || 'Sin título'}
      busy={active !== null}
      onStart={() => { setDismissed((ids) => [...ids, due.id]); startItem(due.id) }}
      onClose={() => setDismissed((ids) => [...ids, due.id])}
    />}
  </>

  let screen: ReactNode
  if (shown === 'curso' && active?.kind === 'breathe') {
    screen = <RespirarGuia
      active={active}
      now={now}
      onPause={actions.pause}
      onResume={actions.resume}
      onFinish={() => { actions.finish(); setView('hoy') }}
      onHoy={() => setView('hoy')}
    />
  } else if (shown === 'curso' && active) {
    screen = <EnCurso
      active={active}
      now={now}
      onPause={actions.pause}
      onResume={actions.resume}
      onFinish={() => { actions.finish(); setView('hoy') }}
      onHoy={() => setView('hoy')}
      onLater={() => setPostpone({ title: active.title })}
      onExtend={actions.extend}
      onBreak={() => { actions.finish(); actions.startBreak() }}
      onBreathe={() => { actions.finish(); setView('respirar') }}
    />
  } else if (shown === 'respirar') {
    screen = <RespirarElegir onBack={() => setView('hoy')} onStart={(minutes) => { actions.startBreathing({ minutes }); setView('curso') }} />
  } else if (shown === 'temporizador') {
    screen = <Temporizador onBack={() => setView('hoy')} onStart={(input) => { actions.startTimer(input); setView('curso') }} />
  } else {
    screen = <Hoy
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

  return <>{screen}{overlays}</>
}
