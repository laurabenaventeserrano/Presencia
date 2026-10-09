import { create } from 'zustand'
import type { AppState } from '../state/types'
import { loadState } from '../storage'
import { localDate } from '../time'

// El estado de la app, de solo lectura para la interfaz. Solo src/actions lo cambia.
export const useAppStore = create<AppState>(() => loadState(localDate(Date.now())))
