import { useEffect, useRef, useState, type FormEvent } from 'react'
import { anchors, anchorLabels, assets, roleLabels, roles, type Anchor, type AssetId, type Role, type VersionId } from './catalog'
import { textLimit, versionFor, type Action, type Context, type Issue } from './domain'
import { commitDecision, loadSession, previewDecision, storageKey, type Pending, type Session } from './storage'
import { DecisionDialog, type DecisionPreview } from './DecisionDialog'
const base = import.meta.env.BASE_URL
const storage = () => window.localStorage
const stageLabels = { draft: 'Review in progress', changes: 'Changes requested', ready: 'Ready for approver' }
type Draft = { type: 'annotate'; anchor: Anchor; text: string } | { type: 'resolve' | 'reopen' | 'changes' | 'handoff' | 'recall' | 'withdraw'; issue?: string; text: string }
type Modal = { pending: Pending; preview: DecisionPreview }
function describe(action: Pending['action'], name: string): DecisionPreview {
  const title = `${name}`
  switch (action.type) {
    case 'annotate': return { title: `Add issue · ${title}`, detail: `${anchorLabels[action.anchor]} — ${action.text}`, consequence: 'The original text, anchor and version will stay together. This new issue returns the version to review and revokes any current approval.', confirm: 'Confirm issue' }
    case 'resolve': return { title: `Resolve issue · ${title}`, detail: action.note, consequence: 'The issue becomes resolved. Its original text, anchor and earlier history remain. You can reopen it later; a new handoff and approval are then required.', confirm: 'Confirm resolution' }
    case 'reopen': return { title: `Reopen issue · ${title}`, detail: action.note, consequence: 'Only the resolved status is undone. The original comment and resolution history remain. Any current approval is revoked; review and handoff are required again.', confirm: 'Confirm reopen' }
    case 'changes': return { title: `Request changes · ${title}`, detail: action.note, consequence: 'A change request is recorded for this exact version. Nothing is sent to anyone. Switch to the creative owner simulation to introduce the bundled replacement.', confirm: 'Confirm change request' }
    case 'handoff': return { title: `Hand off · ${title}`, detail: action.note, consequence: 'You confirm review of this exact version with no open issues. Ari’s approver simulation can then consider it. Earlier approvals are revoked if this handoff changes.', confirm: 'Confirm handoff' }
    case 'recall': return { title: `Recall handoff · ${title}`, detail: action.note, consequence: 'The current handoff is undone. Its history is retained, any current approval is revoked and review must be handed off again.', confirm: 'Confirm recall' }
    case 'introduce': return { title: `Introduce ${title.replace('v1', 'v2')}`, detail: 'Bundled revised creative becomes active.', consequence: 'v1 becomes read-only history. Its comments, change requests and any approval remain on v1. v2 starts without issues, handoff or approval and needs renewed review. This sample cannot roll back the version.', confirm: 'Confirm replacement' }
    case 'approve': return { title: `Approve ${title}`, detail: `Ari · Approver approves only ${title}.`, consequence: 'This is a local fictional decision with no real approval authority. A replacement version will require its own review, handoff and approval. Review edits revoke this approval.', confirm: `Confirm approval of ${title}` }
    case 'withdraw': return { title: `Withdraw approval · ${title}`, detail: action.note, consequence: 'The exact-version approval record remains but is marked revoked. A new reviewer handoff and approver confirmation are required. No old approval is restored.', confirm: 'Confirm withdrawal' }
    case 'reset': return { title: 'Reset both campaign assets?', detail: 'Discard all locally confirmed comments, resolutions, handoffs and approvals for the poster and banner. Restore the original v1 gallery.', consequence: 'This cannot be undone. Invalid saved data will be replaced only if the reset can be saved. Nothing happens in another service.', confirm: 'Reset both assets' }
  }
}
function IssueCard({ issue, readonly, canReview, onEdit }: { issue: Issue; readonly: boolean; canReview: boolean; onEdit: (type: 'resolve' | 'reopen', id: string) => void }) {
  return <article className={`issue ${issue.status}`}>
    <div className="issue-meta"><span className="badge">{issue.status === 'open' ? 'Open issue' : 'Resolved'}</span><span>{issue.asset} / {issue.version}</span></div>
    <strong>{anchorLabels[issue.anchor]}</strong><p>{issue.text}</p><small>Jules · Reviewer · {issue.id}</small>
    {issue.events.length > 0 ? <details><summary>Resolution history ({issue.events.length})</summary>{issue.events.map((e, i) => <p key={i}><strong>{e.kind === 'resolved' ? 'Resolved' : 'Reopened'}:</strong> {e.note}</p>)}</details> : null}
    {!readonly ? <button className="text-button" disabled={!canReview} onClick={() => onEdit(issue.status === 'open' ? 'resolve' : 'reopen', issue.id)}>{issue.status === 'open' ? 'Resolve with context' : 'Reopen issue'}</button> : <p className="subtle">Retained on historical {issue.version}. Review the replacement independently.</p>}
  </article>
}
export default function App() {
  const [session, setSession] = useState<Session>(() => loadSession(storage))
  const sessionRef = useRef(session)
  const [selection, setSelection] = useState<{ asset: AssetId; version: VersionId }>(() => ({ asset: 'poster', version: session.state.assets[0].active }))
  const [role, setRole] = useState<Role>('reviewer')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [modal, setModal] = useState<Modal | null>(null)
  const [message, setMessage] = useState('Open an asset and choose a named anchor to start reviewing.')
  const [filter, setFilter] = useState('all')
  const draftRef = useRef<HTMLTextAreaElement>(null)
  const context: Context = { ...selection, role }
  const asset = assets.find(a => a.id === selection.asset)!
  const data = session.state.assets.find(a => a.id === selection.asset)!
  const version = versionFor(session.state, selection)
  const current = data.active === selection.version
  const editable = current && session.mode !== 'invalid'
  const reviewer = editable && role === 'reviewer'
  const openIssues = version.issues.filter(i => i.status === 'open').length
  const approved = version.approvals.some(p => p.status === 'approved')
  const scope = `${asset.title} ${selection.version}`
  const applySession = (next: Session) => { sessionRef.current = next; setSession(next) }
  const invalidate = () => { setModal(null); setDraft(null); setFilter('all') }
  const choose = (id: AssetId, v: VersionId) => { invalidate(); setSelection({ asset: id, version: v }); setMessage(`Opened ${assets.find(a => a.id === id)!.title} ${v}. Any pending edit was discarded.`) }
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== null) return
      const next = loadSession(storage, sessionRef.current)
      sessionRef.current = next; setSession(next); setModal(null); setDraft(null)
      setSelection(previous => {
        const target = next.state.assets.find(a => a.id === previous.asset)!
        return target.versions.some(v => v.id === previous.version) ? previous : { asset: target.id, version: target.active }
      })
      setMessage('Another tab changed saved review data. Pending edits and previews were cancelled. Review the current state.')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  useEffect(() => { if (draft) draftRef.current?.focus() }, [draft?.type, draft && 'issue' in draft ? draft.issue : '', draft && 'anchor' in draft ? draft.anchor : ''])
  function begin(type: Draft['type'], issue?: string) {
    if (type === 'annotate') setDraft({ type, anchor: 'details', text: '' })
    else setDraft({ type, issue, text: '' })
  }
  function preview(action: Pending['action']) {
    try { const p = previewDecision(sessionRef.current, context, action); setModal({ pending: p.pending, preview: describe(action, scope) }); setMessage('Review the decision preview before confirming.') }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Decision could not be previewed.') }
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!draft) return
    let action: Action
    if (draft.type === 'annotate') action = { type: 'annotate', anchor: draft.anchor, text: draft.text }
    else if (draft.type === 'resolve' || draft.type === 'reopen') action = { type: draft.type, issue: draft.issue!, note: draft.text }
    else action = { type: draft.type, note: draft.text }
    preview(action)
  }
  function confirm() {
    if (!modal) return
    const result = commitDecision(sessionRef.current, modal.pending, context, storage)
    applySession(result.session); invalidate(); setMessage(result.session.notice)
    const target = result.session.state.assets.find(a => a.id === selection.asset)!
    if (result.applied && modal.pending.action.type === 'introduce') setSelection({ asset: selection.asset, version: 'v2' })
    else if (!target.versions.some(v => v.id === selection.version) || modal.pending.action.type === 'reset' && result.applied) setSelection({ asset: selection.asset, version: target.active })
  }
  const nextDecision = !current ? 'This version is historical. Choose the active version to continue.' : approved ? `Approval covers only ${scope}. Any replacement needs renewed review.` : version.stage === 'changes' ? selection.version === 'v1' ? 'Creative owner: introduce the bundled v2, then ask the reviewer to review it.' : 'No further replacement is bundled. Reviewer: resolve and review the current v2 issues, or reset both assets for a fresh sample.' : version.stage === 'ready' ? `Approver: consider an exact-version approval of ${scope}.` : openIssues ? `Reviewer: resolve ${openIssues} open issue${openIssues === 1 ? '' : 's'} or request changes.` : `Reviewer: inspect ${scope}, then hand off this version with a review note.`
  return <>
    <header className="topbar"><a className="brand" href={base} aria-label="Review Room home"><span className="brand-mark">rr</span>Review Room</a><span className="fictional">Northstar · fictional workspace</span><span className="top-note">A decision belongs to a version.</span></header>
    <main>
      <section className="campaign-heading"><div><p className="eyebrow">Campaign / 01</p><h1>Evenings, considered.</h1><p>Two original creatives. One clear review trail.</p></div><div className="role-picker"><label htmlFor="role">Simulate a role</label><select id="role" value={role} onChange={e => { invalidate(); setRole(e.target.value as Role); setMessage('Role changed. Any pending edit was discarded.') }}>{roles.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}</select><small>Local simulation · anyone can switch roles</small></div></section>
      <div className="workspace">
        <aside className="gallery" aria-label="Campaign assets"><h2>Asset library <span>02</span></h2>{assets.map(a => {
          const aData = session.state.assets.find(s => s.id === a.id)!
          return <button key={a.id} className={`asset-card ${selection.asset === a.id ? 'selected' : ''}`} aria-pressed={selection.asset === a.id} onClick={() => choose(a.id, aData.active)}><img src={`${base}media/${a.versions[aData.active].file}`} alt="" /><span className="asset-copy"><strong>{a.title}</strong><small>{a.format}</small><span>{aData.active} · Active</span></span></button>
        })}<p className="gallery-note">Original Northstar artwork.<br />No uploads or external media.</p></aside>
        <section className="review" aria-label="Asset review">
          <div className="asset-heading"><div><p className="eyebrow">{asset.format}</p><h2>{asset.title} <span className={`badge ${current ? 'apricot' : ''}`}>{selection.version} · {current ? 'Active' : 'Historical'}</span></h2><p>{asset.owner}</p></div><span className="review-stage">{approved ? current ? 'Approved · exact version' : 'Historical approval' : stageLabels[version.stage]}</span></div>
          <div className="canvas-shell"><div className={`canvas ${asset.id}`}><img src={`${base}media/${asset.versions[selection.version].file}`} alt={`${asset.title} ${selection.version}. ${asset.versions[selection.version].change}. Fictional campaign media.`} />{anchors.map((anchor, i) => <button key={anchor} className={`anchor anchor-${anchor}`} disabled={!reviewer} aria-label={`Annotate ${anchorLabels[anchor]} on ${scope}`} onClick={() => setDraft({ type: 'annotate', anchor, text: '' })}>{i + 1}</button>)}</div><div className="canvas-caption"><span>{scope} · {asset.versions[selection.version].change}</span><span>SVG / Original sample</span></div></div>
          <div className="version-strip" aria-label="Asset versions">{data.versions.map(v => <button className={selection.version === v.id ? 'chosen' : 'secondary'} key={v.id} aria-pressed={selection.version === v.id} onClick={() => choose(asset.id, v.id)}><span>{v.id}</span><small>{data.active === v.id ? 'Active' : 'Historical'}{v.approvals.some(p => p.status === 'approved') ? ' · Approval on this version' : ''}</small></button>)}{data.active === 'v1' ? <button className="secondary replacement" disabled={!editable || role !== 'owner'} onClick={() => preview({ type: 'introduce' })}>Introduce bundled v2</button> : <p className="subtle">v1 decisions stay on v1.<br />v2 needs its own review.</p>}</div>
          {!current ? <p className="historical-note">Historical {selection.version} is read-only. Comments and approval shown here apply only to {scope}; they do not approve {asset.title} {data.active}.</p> : null}
          <section className="handoff-panel" aria-label="Review handoff"><p className="eyebrow">Next decision</p><h3>{nextDecision}</h3><p className="subtle">Reviewer reviews and hands off. Creative owner introduces v2. Approver confirms a specific version. These roles do not enforce identity or grant real authority.</p><div className="actions">
            <button disabled={!reviewer} onClick={() => begin('annotate')}>Add anchored issue</button>
            <button className="secondary" disabled={!reviewer || !openIssues} onClick={() => begin('changes')}>Request changes</button>
            <button className="secondary" disabled={!reviewer || openIssues > 0 || approved || version.stage === 'ready'} onClick={() => begin('handoff')}>Hand off {selection.version}</button>
            <button className="secondary" disabled={!editable || role !== 'approver' || openIssues > 0 || version.stage !== 'ready' || approved} onClick={() => preview({ type: 'approve' })}>Approve {selection.version}</button>
            {version.stage !== 'draft' && current ? <button className="text-button" disabled={!reviewer} onClick={() => begin('recall')}>Recall handoff</button> : null}
            {approved && current ? <button className="text-button" disabled={!editable || role !== 'approver'} onClick={() => begin('withdraw')}>Withdraw approval</button> : null}
          </div>
          {version.handoffs.length || version.approvals.length ? <details className="trail"><summary>Version decision trail ({version.handoffs.length + version.approvals.length})</summary>{version.handoffs.map(h => <p key={h.id}><strong>{h.kind === 'changes' ? 'Changes requested' : h.kind === 'ready' ? 'Reviewer handoff' : 'Handoff recalled'} · {scope}</strong><br />{h.note}<br /><small>Jules · Reviewer · {h.id}</small></p>)}{version.approvals.map(p => <p key={p.id}><strong>{p.status === 'approved' ? current ? 'Approved' : 'Historical approval' : 'Approval revoked'} · {scope}</strong><br />Ari · Approver · {p.id}{p.reason ? <><br />{p.reason}</> : null}</p>)}</details> : null}
          </section>
        </section>
        <aside className="annotation-rail" aria-label="Version annotations"><div className="rail-heading"><p className="eyebrow">Review notes</p><h2>{selection.version} annotations <span>{version.issues.length.toString().padStart(2, '0')}</span></h2><p>{openIssues} open · {version.issues.length - openIssues} resolved</p></div>
          {draft ? <form className="draft-form" onSubmit={submit}><h3>{draft.type === 'annotate' ? 'Add an issue' : draft.type === 'resolve' ? 'Resolve with context' : draft.type === 'reopen' ? 'Reopen this issue' : draft.type === 'changes' ? 'Request a change' : draft.type === 'handoff' ? 'Review handoff' : draft.type === 'recall' ? 'Recall this handoff' : 'Withdraw this approval'} · {scope}</h3>{draft.type === 'annotate' ? <><label htmlFor="anchor">Anchor on this version</label><select id="anchor" value={draft.anchor} onChange={e => setDraft({ ...draft, anchor: e.target.value as Anchor })}>{anchors.map(a => <option key={a} value={a}>{anchorLabels[a]}</option>)}</select></> : null}
          {'issue' in draft && draft.issue ? <blockquote>{version.issues.find(i => i.id === draft.issue)?.text}</blockquote> : null}
          <label htmlFor="review-text">{draft.type === 'annotate' ? 'Issue description' : 'Decision context'}</label><textarea id="review-text" ref={draftRef} required maxLength={textLimit} rows={4} value={draft.text} onChange={e => setDraft({ ...draft, text: e.target.value })} /><small>{draft.text.length}/{textLimit} characters · retained as plain text</small><div className="actions"><button type="submit">Preview decision</button><button type="button" className="text-button" onClick={() => { setDraft(null); setMessage('Draft cancelled. Confirmed review data is unchanged.'); document.getElementById('role')?.focus() }}>Cancel draft</button></div></form> : null}
          <label className="filter-label" htmlFor="issue-filter">Show issues</label><select id="issue-filter" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All issues</option><option value="open">Open</option><option value="resolved">Resolved</option></select>
          <div className="issues">{version.issues.filter(i => filter === 'all' || i.status === filter).map(i => <IssueCard key={i.id} issue={i} readonly={!current} canReview={reviewer} onEdit={begin} />)}{version.issues.length === 0 ? <div className="empty-notes"><span>＋</span><h3>A fresh look.</h3><p>{selection.version === 'v2' ? 'v1 feedback is retained in history. Review this replacement on its own.' : 'Choose a numbered anchor or add an issue to begin.'}</p></div> : null}{version.issues.length > 0 && !version.issues.some(i => filter === 'all' || i.status === filter) ? <p>No {filter} issues on this version.</p> : null}</div>
        </aside>
      </div>
      <section className="storage-bar" aria-label="Local recovery"><div><strong>{session.mode === 'saved' ? 'Local browser sample' : session.mode === 'invalid' ? 'Saved data needs recovery' : 'Memory only'}</strong><p>{session.notice}</p></div><button className="text-button" onClick={() => preview({ type: 'reset' })}>Reset sample</button></section>
      <p id="review-status" tabIndex={-1} className="announcement" role="status" aria-live="polite">{message}</p>
    </main>
    <footer><span>Fictional creative, people and decisions. Mo: product/program direction. AI: implementation and verification.</span><a href={`${base}docs/product/Case_Study.md`}>Product case study</a><a href={`${base}docs/product/Sample_Walkthrough.md`}>Sample walkthrough</a></footer>
    {modal ? <DecisionDialog preview={modal.preview} onCancel={() => { setModal(null); setMessage('Preview cancelled. Nothing was confirmed.') }} onConfirm={confirm} /> : null}
  </>
}
