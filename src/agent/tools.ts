import { buildPlan, summarize } from '../ai/rules'
import type { ProposePlanArgs } from '../ai/types'
import { focusByDay } from '../days/focus'
import type { AppState, PlanItemStatus } from '../state/types'

// Lo que una IA puede pedir (docs/ARCHITECTURE.md, sección 5). Ninguna herramienta cambia el estado:
// la persona acepta, y entonces la interfaz llama a una acción de src/actions.

type JsonSchema =
  | { type: 'string'; description?: string }
  | { type: 'integer'; description?: string; minimum?: number; maximum?: number }
  | { type: 'object'; properties: Record<string, JsonSchema>; required?: string[] }

export type ToolDefinition = { name: string; description: string; parameters: JsonSchema }

export type ProposePlanInput = { intent: string; date: string; batch?: number }

export const proposePlan = {
  definition: {
    name: 'propose_plan',
    description: 'Propone un borrador de plan del día en bloques a partir de lo que cuenta la persona. No lo aplica.',
    parameters: {
      type: 'object',
      properties: {
        intent: { type: 'string', description: 'Lo que la persona necesita hacer hoy. Vacío para sugerir un día.' },
        date: { type: 'string', description: 'Fecha local YYYY-MM-DD.' },
        batch: { type: 'integer', description: 'Número de tanda de «Otra propuesta».', minimum: 0 },
      },
      required: ['intent', 'date'],
    },
  } satisfies ToolDefinition,
  run: ({ intent, date, batch = 0 }: ProposePlanInput): ProposePlanArgs => {
    const items = buildPlan({ intent, date, batch })
    return { summary: summarize(items), items }
  },
}

export type ReadDayResult = {
  date: string
  intent: string
  items: { title: string; kind: string; plannedMin: number; status: PlanItemStatus; doneMin?: number }[]
  focusMinutes: number
}

export const readDay = {
  definition: {
    name: 'read_day',
    description: 'Devuelve el plan de hoy, el estado de cada bloque y los minutos de foco de hoy.',
    parameters: { type: 'object', properties: {} },
  } satisfies ToolDefinition,
  run: (state: AppState, today: string, timeZone: string): ReadDayResult => ({
    date: today,
    intent: state.plan?.date === today ? state.plan.intent : '',
    items: state.plan?.date === today
      ? state.plan.items.map(({ title, kind, plannedMin, status, doneMin }) => ({ title, kind, plannedMin, status, doneMin }))
      : [],
    focusMinutes: focusByDay(state.records, timeZone).get(today)?.minutes ?? 0,
  }),
}

export const readHistory = {
  definition: {
    name: 'read_history',
    description: 'Devuelve los minutos de foco por día de los últimos N días, del más antiguo al más reciente.',
    parameters: { type: 'object', properties: { days: { type: 'integer', minimum: 1, maximum: 366 } }, required: ['days'] },
  } satisfies ToolDefinition,
  run: (state: AppState, input: { days: number }, today: string, timeZone: string) => {
    const byDay = focusByDay(state.records, timeZone)
    const [year, month, day] = today.split('-').map(Number)
    return Array.from({ length: input.days }, (_, index) => {
      const date = new Date(Date.UTC(year, month - 1, day - (input.days - 1 - index))).toISOString().slice(0, 10)
      return { date, focusMinutes: byDay.get(date)?.minutes ?? 0 }
    })
  },
}

export const tools = [proposePlan.definition, readDay.definition, readHistory.definition]
