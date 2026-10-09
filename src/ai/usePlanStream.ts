import { useCallback, useEffect, useRef, useState } from 'react'
import type { AIProvider, PlanInput, ProposePlanArgs } from './types'

export type PlanStatus = 'idle' | 'streaming' | 'done' | 'cancelled'

// Escucha a la IA: junta el texto palabra a palabra y entrega la llamada a propose_plan.
// No aplica nada: quien la usa decide qué hacer con la propuesta.
export const usePlanStream = (provider: AIProvider, onProposal: (args: ProposePlanArgs) => void) => {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<PlanStatus>('idle')
  const [lastCall, setLastCall] = useState<ProposePlanArgs | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const onProposalRef = useRef(onProposal)
  onProposalRef.current = onProposal

  const ask = useCallback(async (input: PlanInput) => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setText('')
    setStatus('streaming')
    try {
      for await (const event of provider.plan(input, controller.signal)) {
        if (controller.signal.aborted) return
        if (event.type === 'token') setText((current) => current + event.text)
        else if (event.type === 'tool_call') { setLastCall(event.args); onProposalRef.current(event.args) }
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

  return { text, status, lastCall, ask, cancel }
}
