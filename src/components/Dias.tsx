import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { actions } from '../actions'
import { focusByDay } from '../days/focus'
import { dayDetail, dayName, gridWeeks, levelFor } from '../days/grid'
import { useAppStore } from '../store'
import { localDate } from '../time'
import { Dialogo } from './Dialogo'
import { Seccion } from './Seccion'

const WEEKDAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
const FEW_DAYS = 14 // con menos días con foco se ofrece «Ver un ejemplo»

// Días: la cuadrícula, la leyenda y el detalle del día elegido (D1–D16).
export function Dias() {
  const records = useAppStore((state) => state.records)
  const today = localDate(Date.now())
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const byDay = useMemo(() => focusByDay(records, timeZone), [records, timeZone])
  const weeks = useMemo(() => gridWeeks(today), [today])
  const hasExample = records.some((record) => record.example)
  const realDays = useMemo(() => focusByDay(records.filter((record) => !record.example), timeZone).size, [records, timeZone])

  const [selected, setSelected] = useState(today)
  const [focused, setFocused] = useState(today)
  const [confirming, setConfirming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const cellRefs = useRef(new Map<string, HTMLDivElement>())

  // En móvil la cuadrícula se desplaza por dentro; al abrir se ve la semana actual (D9).
  useEffect(() => {
    const scroller = scrollRef.current
    if (scroller) scroller.scrollLeft = scroller.scrollWidth
  }, [])

  const position = (date: string) => {
    for (let week = 0; week < weeks.length; week++) {
      const day = weeks[week].findIndex((candidate) => candidate.date === date)
      if (day >= 0) return { week, day }
    }
    return { week: weeks.length - 1, day: 0 }
  }

  const moveTo = (date: string) => {
    setFocused(date)
    cellRefs.current.get(date)?.focus()
  }

  // Flechas para moverse entre días, Enter o Espacio para elegir (D8).
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const { week, day } = position(focused)
    const delta: Record<string, [number, number]> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }
    if (event.key in delta) {
      event.preventDefault()
      const [dw, dd] = delta[event.key]
      const target = weeks[week + dw]?.[day + dd]
      if (target && !target.future) moveTo(target.date)
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      moveTo(event.key === 'Home' ? weeks[0][0].date : today)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setSelected(focused)
    }
  }

  const info = byDay.get(selected) ?? { minutes: 0, blocks: 0 }

  return (
    <Seccion title="Días" wide>
      {byDay.size === 0 && <p className="pantalla__texto">
        Aún no hay días con foco. <Link className="texto-control" to="/">Planifica tu día</Link>
      </p>}
      {hasExample && <p className="etiqueta dias__ejemplo">Ejemplo: se ven los días de una persona de ejemplo junto a los tuyos.</p>}

      <div className="dias__marco" ref={scrollRef}>
        <div className="dias" role="grid" aria-label="Tus días de los últimos 12 meses" aria-describedby="dias-detalle" onKeyDown={onKey}>
          {WEEKDAYS.map((name, day) => <div key={name} role="row" aria-label={name} className="dias__fila">
            {weeks.map((week) => {
              const cell = week[day]
              if (cell.future) return <div key={cell.date} role="gridcell" aria-hidden="true" className="dia dia--futuro" />
              const minutes = byDay.get(cell.date)?.minutes ?? 0
              return <div
                key={cell.date}
                ref={(element) => { if (element) cellRefs.current.set(cell.date, element); else cellRefs.current.delete(cell.date) }}
                role="gridcell"
                className="dia"
                data-level={levelFor(minutes)}
                data-date={cell.date}
                aria-label={dayName(cell.date, minutes)}
                aria-selected={cell.date === selected}
                tabIndex={cell.date === focused ? 0 : -1}
                onClick={() => { setFocused(cell.date); setSelected(cell.date) }}
              />
            })}
          </div>)}
        </div>
      </div>

      <div className="leyenda" aria-label="Leyenda: de menos a más foco">
        <span>Menos</span>
        {[1, 2, 3, 4, 5].map((level) => <span key={level} className="dia dia--leyenda" data-level={level} aria-hidden="true" />)}
        <span>Más</span>
      </div>

      <p id="dias-detalle" className="dias__detalle" aria-live="polite">{dayDetail(selected, info.minutes, info.blocks)}</p>

      <div className="acciones">
        {!hasExample && realDays < FEW_DAYS && <button className="texto-control" type="button" onClick={() => actions.loadExample()}>Ver un ejemplo</button>}
        {hasExample && <button className="texto-control" type="button" onClick={() => actions.removeExample()}>Quitar ejemplo</button>}
      </div>

      <p className="pantalla__texto">Tus días se guardan solo en este navegador.</p>
      <button className="boton" type="button" onClick={() => setConfirming(true)}>Borrar mis datos</button>
      <Dialogo open={confirming} title="¿Borrar todos tus datos?" onClose={() => setConfirming(false)}>
        <p className="pantalla__texto">Se borran tus días, tu plan y el ejemplo. No se puede deshacer.</p>
        <div className="acciones">
          <button className="boton boton--oscuro" type="button" onClick={() => { actions.clearData(); setConfirming(false); setSelected(today) }}>Borrar</button>
          <button className="boton" type="button" onClick={() => setConfirming(false)}>Cancelar</button>
        </div>
      </Dialogo>
    </Seccion>
  )
}
