import { useCallback, useEffect, useRef, useState } from 'react'
import type { Task } from '../store'
import type { AIProvider, ProposedBlock } from './types'

export type PlanStatus = 'idle' | 'streaming' | 'done' | 'cancelled'

export const usePlanStream = (provider: AIProvider) => {
  const [text, setText] = useState('')
  const [proposedBlocks, setProposedBlocks] = useState<ProposedBlock[]>([])
  const [status, setStatus] = useState<PlanStatus>('idle')
  const controllerRef = useRef<AbortController | null>(null)

  const start = useCallback(async (intention: string, tasks: Task[]) => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setText('')
    setProposedBlocks([])
    setStatus('streaming')

    try {
      for await (const event of provider.plan({ intention, tasks, memory: [] }, controller.signal)) {
        // Tras cancelar (o desmontar) no se toca el estado.
        if (controller.signal.aborted) return
        if (event.type === 'token') setText((current) => current + event.text)
        else if (event.type === 'blocks') setProposedBlocks(event.blocks)
        else setStatus('done')
      }
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null
    }
  }, [provider])

  const cancel = useCallback(() => {
    if (!controllerRef.current) return
    controllerRef.current.abort()
    controllerRef.current = null
    setStatus('cancelled')
  }, [])

  useEffect(() => () => controllerRef.current?.abort(), [])

  return { text, proposedBlocks, status, start, cancel }
}
