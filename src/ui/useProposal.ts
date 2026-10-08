import { useEffect, useMemo, useRef, useState } from 'react'
import { createMockProvider } from '../ai/mock-provider'
import { usePlanStream } from '../ai/usePlanStream'
import type { Task } from '../store'
import { ProposalRow, proposalRows, removeRow, stepMinutes, updateRow } from './logic'

// El borrador de la propuesta vive en App, no en Hoy: así sobrevive a ir a En curso y volver.
export const useProposal = (tasks: Task[]) => {
  const provider = useMemo(() => createMockProvider(), [])
  const { text, proposedBlocks, status, start, cancel } = usePlanStream(provider)
  const [rows, setRows] = useState<ProposalRow[]>([])
  const tasksRef = useRef(tasks)
  tasksRef.current = tasks

  // Cada respuesta nueva de la IA sustituye el borrador anterior.
  useEffect(() => setRows(proposalRows(proposedBlocks, tasksRef.current)), [proposedBlocks])

  // La IA solo planifica con lo que aún está pendiente.
  const ask = (intention: string) => void start(intention, tasks.filter((task) => !task.done))

  return {
    text,
    status,
    rows,
    ask,
    cancel,
    stepRow: (key: string, direction: 1 | -1) =>
      setRows((current) => updateRow(current, key, (row) => ({ ...row, minutes: stepMinutes(row.minutes, direction) }))),
    renameRow: (key: string, title: string) =>
      setRows((current) => updateRow(current, key, (row) => ({ ...row, title }))),
    removeRow: (key: string) => setRows((current) => removeRow(current, key)),
  }
}

export type Proposal = ReturnType<typeof useProposal>
