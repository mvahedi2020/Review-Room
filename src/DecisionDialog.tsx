import { useEffect, useRef } from 'react'
export type DecisionPreview = { title: string; detail: string; consequence: string; confirm: string }
export function DecisionDialog({ preview, onCancel, onConfirm }: { preview: DecisionPreview; onCancel: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    const before = document.activeElement
    dialog?.showModal()
    return () => {
      dialog?.close()
      requestAnimationFrame(() => {
        if (before instanceof HTMLElement && before.isConnected && !(before instanceof HTMLButtonElement && before.disabled)) before.focus()
        else document.getElementById('review-status')?.focus()
      })
    }
  }, [])
  return <dialog ref={ref} aria-labelledby="decision-title" aria-describedby="decision-consequence" onCancel={onCancel} onKeyDown={event => {
      if (event.key !== 'Tab') return
      const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
      const first = buttons[0], last = buttons.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }}>
    <p className="eyebrow">Decision preview</p><h2 id="decision-title">{preview.title}</h2>
    <div className="preview-detail">{preview.detail}</div><p id="decision-consequence">{preview.consequence}</p>
    <p className="subtle">Nothing changes until you confirm.</p>
    <div className="dialog-actions"><button autoFocus className="secondary" onClick={onCancel}>Cancel</button><button onClick={onConfirm}>{preview.confirm}</button></div>
  </dialog>
}
