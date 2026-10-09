import type { AppState, Ctx } from '../state/types'
import { saveState } from '../storage'
import { useAppStore } from '../store'
import { localDate } from '../time'
import * as timer from './timer'

// El único sitio que aplica una acción al estado y la guarda. La interfaz y las herramientas pasan por aquí.
const ctx = (): Ctx => {
  const now = Date.now()
  return { now, today: localDate(now), id: () => crypto.randomUUID() }
}

const commit = (next: AppState) => {
  if (next === useAppStore.getState()) return
  useAppStore.setState(next, true)
  saveState(next)
}

const run = <A extends unknown[]>(action: (state: AppState, ...args: [...A, Ctx]) => AppState) =>
  (...args: A) => commit(action(useAppStore.getState(), ...args, ctx()))

export const actions = {
  startTimer: run(timer.startTimer),
  startBreathing: run(timer.startBreathing),
  startBreak: run(timer.startBreak),
  pause: run(timer.pause),
  resume: run(timer.resume),
  extend: run(timer.extend),
  finish: run(timer.finish),
}
