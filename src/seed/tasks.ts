import type { PlanTask } from '../ai/types'

// Solo para la demo: se cargan con «Cargar tareas de ejemplo» cuando la lista está vacía.
export const sampleTaskTitles = [
  'Escribir la propuesta del proyecto',
  'Responder emails pendientes',
  'Revisar el contrato con el cliente',
  'Diseñar la pantalla de inicio',
  'Pagar las facturas del mes',
  'Leer el informe trimestral',
]

// Temporal: el chat aún planifica con estas tareas hasta que use las del store.
export const seedTasks: PlanTask[] = sampleTaskTitles.map((title, index) => ({ id: `seed-${index}`, title }))
