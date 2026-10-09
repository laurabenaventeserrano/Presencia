import type { AppState, Ctx, Settings } from '../state/types'

export const setSetting = (state: AppState, _ctx: Ctx, key: keyof Settings, value: boolean): AppState =>
  ({ ...state, settings: { ...state.settings, [key]: value } })
