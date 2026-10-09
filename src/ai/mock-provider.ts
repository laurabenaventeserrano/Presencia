import { buildPlan, summarize } from './rules'
import type { AIProvider } from './types'

type MockProviderOptions = {
  sleep?: (ms: number) => Promise<void>
}

const MIN_LATENCY_MS = 30
const MAX_LATENCY_MS = 70

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// Math.random solo decide la espera entre palabras, nunca el contenido.
const latency = () => MIN_LATENCY_MS + Math.floor(Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS + 1))

// Cada palabra conserva su espacio final para que unidas reproduzcan el texto exacto.
const tokenize = (text: string) => text.match(/\S+\s*/g) ?? []

// La IA simulada: escribe el resumen palabra a palabra y después llama a propose_plan.
// No toca el estado de la app ni usa red. Se puede cancelar.
export const createMockProvider = ({ sleep = defaultSleep }: MockProviderOptions = {}): AIProvider => ({
  async *plan(input, signal) {
    const items = buildPlan(input)
    const summary = summarize(items)

    for (const token of tokenize(summary)) {
      if (signal?.aborted) return
      await sleep(latency())
      if (signal?.aborted) return
      yield { type: 'token', text: token }
    }

    if (signal?.aborted) return
    yield { type: 'tool_call', name: 'propose_plan', args: { summary, items } }
    yield { type: 'done' }
  },
})
