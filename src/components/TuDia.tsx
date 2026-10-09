import { formatDuration, totalMinutes } from '../ai/rules'
import type { PlanItem } from '../state/types'
import { timeOfDay } from '../time'

export type DayRow = Pick<PlanItem, 'id' | 'kind' | 'title' | 'plannedMin' | 'status' | 'laterUntil' | 'doneMin'>

export const statusText = (row: DayRow) => {
  if (row.status === 'done') return `Hecho, ${row.doneMin ?? row.plannedMin} min`
  if (row.status === 'later' && row.laterUntil) return `Más tarde, ${timeOfDay(row.laterUntil)}`
  if (row.status === 'running') return 'En curso'
  return 'Pendiente'
}

type TuDiaProps = {
  rows: DayRow[]
  onAnother: () => void
  busy: boolean
}

// La lista de bloques del día. La propuesta de la IA se ve aquí como borrador editable.
export function TuDia({ rows, onAnother, busy }: TuDiaProps) {
  return (
    <section className="tarjeta" aria-labelledby="tu-dia">
      <div className="tu-dia__cabecera">
        <h2 id="tu-dia" className="etiqueta">Tu día</h2>
        <p className="etiqueta">Total: {formatDuration(totalMinutes(rows))}</p>
      </div>
      <ul className="lista">
        {rows.map((row) => <li key={row.id} className="fila" data-status={row.status}>
          <div className="fila__cabecera">
            <span className={row.status === 'done' ? 'fila__nombre fila__nombre--hecha' : 'fila__nombre'}>{row.title || 'Sin título'}</span>
            <span className="fila__valor">{row.plannedMin} min</span>
          </div>
          <p className="fila__estado">{statusText(row)}</p>
        </li>)}
      </ul>
      <div className="fila__acciones">
        <button className="boton" type="button" onClick={onAnother} disabled={busy}>Otra propuesta</button>
      </div>
    </section>
  )
}
