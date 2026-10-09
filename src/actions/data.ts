import { exampleYear } from '../days/grid'
import { type AppState, type Ctx, emptyState } from '../state/types'

// «Ver un ejemplo»: un año de una persona de ejemplo, sumado a lo real.
export const loadExample = (state: AppState, ctx: Ctx): AppState =>
  state.records.some((record) => record.example) ? state : { ...state, records: [...exampleYear(ctx.today), ...state.records] }

// «Quitar ejemplo»: solo se van los datos de ejemplo.
export const removeExample = (state: AppState): AppState => ({ ...state, records: state.records.filter((record) => !record.example) })

// «Borrar mis datos»: todo en blanco, ejemplo incluido.
export const clearData = (): AppState => emptyState
