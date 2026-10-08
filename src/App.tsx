import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { EnCurso, Respirar } from './components/Foco'
import { Hoy } from './components/Hoy'
import { dayKey, getActiveBlock, useFocusStore } from './store'
import { FALLBACK_TITLE, FocusPhase, formatTime, ProposalRow } from './ui/logic'
import './components/controls.css'

type Device = 'ordenador' | 'movil' | 'reloj'
type Screen = 'hoy' | 'curso' | 'resp'

const TASK_MINUTES = 25

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/app" element={<Presencia device="ordenador" />} />
      <Route path="/m" element={<Presencia device="movil" />} />
      <Route path="/watch" element={<Presencia device="reloj" />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}

function Presencia({ device }: { device: Device }) {
  const tasks = useFocusStore((state) => state.tasks)
  const days = useFocusStore((state) => state.days)
  const selectedTaskId = useFocusStore((state) => state.selectedTaskId)
  const durationMinutes = useFocusStore((state) => state.durationMinutes)
  const addTask = useFocusStore((state) => state.addTask)
  const start = useFocusStore((state) => state.start)
  const startBlock = useFocusStore((state) => state.startBlock)
  const pause = useFocusStore((state) => state.pause)
  const resume = useFocusStore((state) => state.resume)
  const finish = useFocusStore((state) => state.finish)
  const reset = useFocusStore((state) => state.reset)

  const today = days[dayKey()] ?? { date: dayKey(), taskIds: tasks.map((task) => task.id), blocks: [] }
  const activeBlock = getActiveBlock(today.blocks)
  const isRunning = activeBlock?.status === 'running'
  const isWatch = device === 'reloj'

  const [now, setNow] = useState(Date.now())
  const [screen, setScreen] = useState<Screen>(activeBlock || isWatch ? 'curso' : 'hoy')
  // Título del bloque que acaba de terminar solo: se queda en pantalla con el orbe en Hecho.
  const [doneTitle, setDoneTitle] = useState<string | null>(null)

  const titleOf = (taskId: string) => tasks.find((task) => task.id === taskId)?.title ?? FALLBACK_TITLE

  const remainingSeconds = activeBlock
    ? isRunning && activeBlock.endsAt
      ? Math.max(0, Math.ceil((activeBlock.endsAt - now) / 1000))
      : activeBlock.remainingSeconds
    : doneTitle !== null ? 0 : durationMinutes * 60

  const phase: FocusPhase = activeBlock
    ? isRunning ? 'en-marcha' : 'en-pausa'
    : doneTitle !== null ? 'hecho' : 'listo'

  useEffect(() => {
    if (!isRunning) return
    const interval = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(interval)
  }, [isRunning])

  // El timer guarda endsAt: cuando se alcanza, el bloque se completa solo.
  useEffect(() => {
    if (isRunning && activeBlock?.endsAt && activeBlock.endsAt <= now) {
      setDoneTitle(activeBlock.title || FALLBACK_TITLE)
      finish()
    }
  })

  useEffect(() => {
    document.title = isRunning ? `${formatTime(remainingSeconds)} · Presencia` : 'Presencia'
  }, [isRunning, remainingSeconds])

  // Empezar es siempre el mismo camino: startBlock del store, que no hace nada si ya hay un bloque.
  const handleStartBlock = (title: string, minutes: number, taskId?: string) => {
    startBlock({ title, minutes, taskId })
    setDoneTitle(null)
    setScreen('curso')
  }

  const findTask = (title: string) => useFocusStore.getState().tasks.find((task) => task.title === title)

  const handleStart = ({ title, minutes, taskId }: ProposalRow) => handleStartBlock(title, minutes, taskId)
  const handleSave = (title: string) => { if (!findTask(title)) addTask(title) }
  const handleStartTask = (taskId: string) => handleStartBlock(titleOf(taskId), TASK_MINUTES, taskId)

  const handleClose = () => {
    if (phase === 'hecho') setDoneTitle(null)
    else if (isWatch) reset()
    else finish()
    if (!isWatch) setScreen('hoy')
  }

  const handleToggle = () => {
    if (phase === 'en-marcha') pause()
    else if (phase === 'en-pausa') resume()
    else if (phase === 'listo') { start(); setDoneTitle(null) }
  }

  const completedTaskIds = new Set(today.blocks.flatMap((block) => block.status === 'completed' && block.taskId ? [block.taskId] : []))

  // Sin bloque ni resumen pendiente, En curso no tiene sentido fuera del reloj.
  const showHoy = !isWatch && (screen === 'hoy' || (screen === 'curso' && phase === 'listo'))
  const blockTitle = activeBlock ? activeBlock.title || FALLBACK_TITLE : doneTitle ?? titleOf(selectedTaskId)

  return (
    <main className="app" data-device={device} data-theme={isWatch ? 'noche' : undefined}>
      {showHoy
        ? <Hoy
          device={device === 'movil' ? 'movil' : 'ordenador'}
          tasks={tasks}
          doneTaskIds={completedTaskIds}
          busy={Boolean(activeBlock)}
          onStart={handleStart}
          onSave={handleSave}
          onStartTask={handleStartTask}
        />
        : screen === 'resp'
          ? <Respirar onClose={() => setScreen('curso')} />
          : <EnCurso
            title={blockTitle}
            seconds={remainingSeconds}
            phase={phase}
            closeLabel={phase === 'hecho' ? 'Volver' : isWatch ? 'Reiniciar' : 'Terminar bloque'}
            onClose={phase === 'listo' ? undefined : handleClose}
            onToggle={phase === 'hecho' ? undefined : handleToggle}
            onBreathe={() => setScreen('resp')}
          />}
    </main>
  )
}

export default App
