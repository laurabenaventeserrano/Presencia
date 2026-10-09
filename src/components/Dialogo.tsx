import { ReactNode, useEffect, useId, useRef } from 'react'

type DialogoProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

// Diálogo nativo: atrapa el foco mientras está abierto y Escape lo cierra (B10).
export function Dialogo({ open, title, onClose, children }: DialogoProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={ref} className="dialogo" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose() }}>
      {open && <>
        <h2 id={titleId} className="dialogo__titulo">{title}</h2>
        {children}
      </>}
    </dialog>
  )
}
