import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { EnCurso, Respirar } from './components/Foco'
import { Hoy } from './components/Hoy'
import { Block, dayKey, useFocusStore } from './store'
import { FocusPhase, formatTime } from './ui/logic'
import './components/controls.css'

type Device = 'ordenador' | 'movil' | 'reloj'
type Screen = 'hoy' | 'curso' | 'resp'

const TASK_MINUTES = 25

const getActiveBlock = (blocks: Block[]) => [...blocks].reverse().find(
  (block) => block.status === 'running' || block.status === 'paused',
)

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
  const selectTask = useFocusStore((state) => state.selectTask)
  const setDuration = useFocusStore((state) => state.setDuration)
  const start = useFocusStore((state) => state.start)
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

  const titleOf = (taskId: string) => tasks.find((task) => task.id === taskId)?.title ?? 'Bloque de foco'

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
      setDoneTitle(titleOf(activeBlock.taskId))
      finish()
    }
  })

  useEffect(() => {
    document.title = isRunning ? `${formatTime(remainingSeconds)} · Presencia` : 'Presencia'
  }, [isRunning, remainingSeconds])

  // Empezar es siempre el mismo camino: elegir la tarea, fijar los minutos y arrancar.
  const startBlock = (taskId: string | null, title: string, minutes: number) => {
    if (taskId) selectTask(taskId)
    else addTask(title)
    setDuration(minutes)
    start()
    setDoneTitle(null)
    setScreen('curso')
  }

  const findTask = (title: string) => useFocusStore.getState().tasks.find((task) => task.title === title)

  const handleStart = (title: string, minutes: number) => startBlock(findTask(title)?.id ?? null, title, minutes)
  const handleSave = (title: string) => { if (!findTask(title)) addTask(title) }
  const handleStartTask = (taskId: string) => startBlock(taskId, titleOf(taskId), TASK_MINUTES)

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

  const completedTaskIds = new Set(today.blocks.filter((block) => block.status === 'completed').map((block) => block.taskId))
  const todayTasks = today.taskIds.map((id) => tasks.find((task) => task.id === id)).filter((task) => task !== undefined)

  // Sin bloque ni resumen pendiente, En curso no tiene sentido fuera del reloj.
  const showHoy = !isWatch && (screen === 'hoy' || (screen === 'curso' && phase === 'listo'))
  const blockTitle = activeBlock ? titleOf(activeBlock.taskId) : doneTitle ?? titleOf(selectedTaskId)

  return (
    <main className="app" data-device={device} data-theme={isWatch ? 'noche' : undefined}>
      {showHoy
        ? <Hoy
          device={device === 'movil' ? 'movil' : 'ordenador'}
          tasks={todayTasks}
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
