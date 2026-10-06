import { FormEvent, useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Check, ChevronRight, CircleHelp, Clock3, Pause, Play, Plus, RotateCcw, Smartphone, Watch } from 'lucide-react'
import { Block, dayKey, useFocusStore } from './store'

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainder}`
}

const getActiveBlock = (blocks: Block[]) => [...blocks].reverse().find(
  (block) => block.status === 'running' || block.status === 'paused',
)

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/app" element={<FocusScreen />} />
      <Route path="/m" element={<FocusScreen />} />
      <Route path="/watch" element={<FocusScreen />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}

function FocusScreen() {
  const location = useLocation()
  const isMobile = location.pathname === '/m'
  const isWatch = location.pathname === '/watch'
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
  const [now, setNow] = useState(Date.now())
  const [taskDraft, setTaskDraft] = useState('')
  const today = days[dayKey()] ?? { date: dayKey(), taskIds: tasks.map((task) => task.id), blocks: [] }
  const activeBlock = getActiveBlock(today.blocks)
  const isRunning = activeBlock?.status === 'running'
  const isPaused = activeBlock?.status === 'paused'
  const remainingSeconds = activeBlock
    ? isRunning && activeBlock.endsAt
      ? Math.max(0, Math.ceil((activeBlock.endsAt - now) / 1000))
      : activeBlock.remainingSeconds
    : durationMinutes * 60
  const progress = activeBlock ? 1 - remainingSeconds / activeBlock.durationSeconds : 0
  const activeTaskId = activeBlock?.taskId ?? selectedTaskId
  const activeTask = tasks.find((task) => task.id === activeTaskId) ?? tasks[0]
  const completedBlocks = today.blocks.filter((block) => block.status === 'completed')
  const completedMinutes = Math.round(completedBlocks.reduce((total, block) => total + (block.completedSeconds ?? block.durationSeconds), 0) / 60)
  const taskCount = new Set(completedBlocks.map((block) => block.taskId)).size
  const circumference = 2 * Math.PI * 108

  useEffect(() => {
    if (!isRunning) return
    const interval = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(interval)
  }, [isRunning])

  useEffect(() => {
    if (isRunning && activeBlock?.endsAt && activeBlock.endsAt <= now) finish()
  }, [activeBlock?.endsAt, finish, isRunning, now])

  const handleAddTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    addTask(taskDraft)
    setTaskDraft('')
  }

  const dateLabel = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
  const shellClass = `workspace${isMobile ? ' workspace--mobile' : ''}${isWatch ? ' workspace--watch' : ''}`

  return (
    <main className={shellClass}>
      {!isMobile && !isWatch && <aside className="sidebar">
        <Link className="brand" to="/app" aria-label="Presencia, inicio">
          <span className="brand-mark"><span /></span>
          <span>PRESENCIA</span>
        </Link>
        <div className="sidebar-rule" />
        <p className="nav-label">ESPACIO</p>
        <Link className="nav-link nav-link--active" to="/app"><Clock3 size={17} strokeWidth={1.7} />Enfoque</Link>
        <p className="nav-label nav-label--devices">VISTAS</p>
        <Link className="nav-link" to="/m"><Smartphone size={17} strokeWidth={1.7} />Móvil</Link>
        <Link className="nav-link" to="/watch"><Watch size={17} strokeWidth={1.7} />Reloj</Link>
        <div className="sidebar-bottom">
          <div className="day-mark"><span className="day-mark__dot" />DÍA ACTIVO</div>
          <span className="sidebar-date">{dateLabel}</span>
        </div>
      </aside>}

      <section className="main-panel">
        {isMobile || isWatch ? <header className="compact-header">
          <Link className="brand" to="/app" aria-label="Volver a Presencia">
            <span className="brand-mark"><span /></span><span>PRESENCIA</span>
          </Link>
          <Link to={isWatch ? '/m' : '/watch'} className="mode-link" aria-label={isWatch ? 'Vista móvil' : 'Vista reloj'}>
            {isWatch ? <Smartphone size={18} /> : <Watch size={18} />}
          </Link>
        </header> : <header className="topbar">
          <div>
            <p className="eyebrow">TU ESPACIO DE TRABAJO</p>
            <h1>Vuelve a lo que importa.</h1>
          </div>
          <button className="icon-button help-button" type="button" aria-label="Ayuda"><CircleHelp size={19} strokeWidth={1.7} /></button>
        </header>}

        <div className="focus-layout">
          <section className="timer-column" aria-label="Temporizador de enfoque">
            {isMobile && <p className="mobile-date">{dateLabel}</p>}
            {isWatch && <p className="watch-date">{new Intl.DateTimeFormat('es', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date())}</p>}
            <div className="timer-heading">
              <span className="live-indicator"><span />{isRunning ? 'SESIÓN EN CURSO' : isPaused ? 'SESIÓN EN PAUSA' : 'LISTO PARA EMPEZAR'}</span>
              {!isWatch && <span className="timer-duration"><Clock3 size={14} />{activeBlock ? Math.round(activeBlock.durationSeconds / 60) : durationMinutes} MIN</span>}
            </div>
            <div className="timer-wrap">
              <svg className="progress-ring" viewBox="0 0 240 240" role="img" aria-label={`${formatTime(remainingSeconds)} restantes`}>
                <circle className="ring-track" cx="120" cy="120" r="108" />
                <circle
                  className="ring-progress"
                  cx="120"
                  cy="120"
                  r="108"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                />
              </svg>
              <div className="timer-readout">
                <span className="timer-time">{formatTime(remainingSeconds)}</span>
                <span className="timer-caption">{isPaused ? 'TIEMPO RESTANTE' : isRunning ? 'PARA TU SIGUIENTE PAUSA' : 'MINUTOS PARA TI'}</span>
              </div>
            </div>
            <div className="current-task">
              <span className="current-task__label">AHORA</span>
              <span className="current-task__name">{activeTask?.title ?? 'Elige una tarea'}</span>
            </div>
            <div className="timer-actions">
              {!activeBlock ? <button className="primary-button" type="button" onClick={start}><Play size={16} fill="currentColor" />Empezar enfoque</button>
                : isRunning ? <button className="primary-button" type="button" onClick={pause}><Pause size={16} fill="currentColor" />Pausar</button>
                  : <button className="primary-button" type="button" onClick={resume}><Play size={16} fill="currentColor" />Continuar</button>}
              {activeBlock && <button className="secondary-button" type="button" onClick={finish}><Check size={16} />Terminar</button>}
              {activeBlock && <button className="icon-button reset-button" type="button" onClick={reset} aria-label="Reiniciar sesión"><RotateCcw size={16} /></button>}
            </div>
            {!activeBlock && <div className="duration-picker" role="group" aria-label="Duración del enfoque">
              {[15, 25, 45].map((minutes) => <button
                className={durationMinutes === minutes ? 'duration-option duration-option--active' : 'duration-option'}
                key={minutes}
                onClick={() => setDuration(minutes)}
                type="button"
              >{minutes} min</button>)}
            </div>}
          </section>

          {!isWatch && <aside className="day-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">{dateLabel}</p><h2>Tu día, en calma.</h2></div>
              <span className="session-count">{completedBlocks.length.toString().padStart(2, '0')}</span>
            </div>
            <div className="daily-summary">
              <div className="summary-item"><span className="summary-value">{completedMinutes}<small>m</small></span><span className="summary-label">ENFOCADOS</span></div>
              <div className="summary-divider" />
              <div className="summary-item"><span className="summary-value">{taskCount.toString().padStart(2, '0')}</span><span className="summary-label">TAREAS</span></div>
              <ChevronRight className="summary-arrow" size={16} />
            </div>
            <div className="task-section-heading"><h3>Tu lista</h3><span>{today.taskIds.length} tareas</span></div>
            <div className="task-list">
              {today.taskIds.map((taskId) => {
                const task = tasks.find((item) => item.id === taskId)
                if (!task) return null
                const done = completedBlocks.some((block) => block.taskId === task.id)
                const selected = activeTaskId === task.id
                return <button
                  key={task.id}
                  className={`task-item${selected ? ' task-item--selected' : ''}${done ? ' task-item--done' : ''}`}
                  type="button"
                  onClick={() => !activeBlock && selectTask(task.id)}
                  disabled={Boolean(activeBlock)}
                >
                  <span className="task-check">{done ? <Check size={12} /> : <span />}</span>
                  <span className="task-title">{task.title}</span>
                  {selected && !activeBlock && <span className="task-current">AHORA</span>}
                </button>
              })}
            </div>
            <form className="add-task-form" onSubmit={handleAddTask}>
              <label className="sr-only" htmlFor="new-task">Nueva tarea</label>
              <Plus size={16} />
              <input id="new-task" value={taskDraft} onChange={(event) => setTaskDraft(event.target.value)} placeholder="Añadir una tarea" />
              <button type="submit" aria-label="Añadir tarea" disabled={!taskDraft.trim()}><Plus size={16} /></button>
            </form>
            <div className="panel-footer"><span>UN PASO A LA VEZ</span><span>·</span><span>VAS BIEN</span></div>
          </aside>}
        </div>
      </section>
    </main>
  )
}

export default App