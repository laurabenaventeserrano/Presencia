import type { Task } from '../store'

// Temporal, se sustituye por el store en el cachito 5.
export const seedTasks: Task[] = [
  { id: 'seed-write', title: 'Escribir la propuesta del proyecto', createdAt: 0 },
  { id: 'seed-email', title: 'Responder emails pendientes', createdAt: 0 },
  { id: 'seed-review', title: 'Revisar el contrato con el cliente', createdAt: 0 },
  { id: 'seed-design', title: 'Diseñar la pantalla de inicio', createdAt: 0 },
  { id: 'seed-bills', title: 'Pagar las facturas del mes', createdAt: 0 },
  { id: 'seed-read', title: 'Leer el informe trimestral', createdAt: 0 },
]
