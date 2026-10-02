import { useEffect, useRef } from 'react'
export type DecisionPreview = { title: string; detail: string; consequence: string; confirm: string }
export function DecisionDialog({ preview, onCancel, onConfirm }: { preview: DecisionPreview; onCancel: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    const before = document.activeElement
    dialog?.showModal()
    return () => { dialog?.close(); if (before instanceof HTMLElement && before.isConnected) before.focus() }
  }, [])
  return <dialog ref={ref} aria-labelledby="decision-title" aria-describedby="decision-consequence" onCancel={onCancel}>
    <p className="eyebrow">Decision preview</p><h2 id="decision-title">{preview.title}</h2>
    <div className="preview-detail">{preview.detail}</div><p id="decision-consequence">{preview.consequence}</p>
    <p className="subtle">Nothing changes until you confirm.</p>
    <div className="dialog-actions"><button autoFocus className="secondary" onClick={onCancel}>Cancel</button><button onClick={onConfirm}>{preview.confirm}</button></div>
  </dialog>
}
