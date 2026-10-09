import { buildBlocks } from './rules'
import type { AIProvider } from './types'

type MockProviderOptions = {
  sleep?: (ms: number) => Promise<void>
}

const MIN_LATENCY_MS = 40
const MAX_LATENCY_MS = 90

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// Math.random solo decide la espera entre tokens, nunca el contenido.
const latency = () => MIN_LATENCY_MS + Math.floor(Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS + 1))

// Cada token conserva su espacio final para que unidos reproduzcan el texto exacto.
const tokenize = (text: string) => text.match(/\S+\s*/g) ?? []

export const createMockProvider = ({ sleep = defaultSleep }: MockProviderOptions = {}): AIProvider => ({
  async *plan(input, signal) {
    const blocks = buildBlocks(input)
    const text = `Te propongo ${blocks.filter((block) => block.kind === 'focus').length} bloques.`

    for (const token of tokenize(text)) {
      if (signal?.aborted) return
      await sleep(latency())
      if (signal?.aborted) return
      yield { type: 'token', text: token }
    }

    if (signal?.aborted) return
    yield { type: 'blocks', blocks }
    yield { type: 'done' }
  },
})
