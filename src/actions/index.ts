import type { AppState, Ctx } from '../state/types'
import { saveState } from '../storage'
import { useAppStore } from '../store'
import { localDate } from '../time'
import * as plan from './plan'
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

// Primero el estado y el contexto; después, lo que pase la interfaz. Un argumento de más (como el evento de un clic) se ignora.
const run = <A extends unknown[]>(action: (state: AppState, ctx: Ctx, ...args: A) => AppState) =>
  (...args: A) => commit(action(useAppStore.getState(), ctx(), ...args))

export const actions = {
  createPlan: run(plan.createPlan),
  startTimer: run(timer.startTimer),
  startBreathing: run(timer.startBreathing),
  startBreak: run(timer.startBreak),
  pause: run(timer.pause),
  resume: run(timer.resume),
  extend: run(timer.extend),
  finish: run(timer.finish),
}
