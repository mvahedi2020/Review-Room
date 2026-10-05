import { anchors, assets, roles, type Anchor, type AssetId, type Role, type VersionId } from './catalog'
export type Issue = { id: string; asset: AssetId; version: VersionId; anchor: Anchor; text: string; author: 'reviewer'; status: 'open' | 'resolved'; events: { kind: 'resolved' | 'reopened'; note: string }[] }
export type Approval = { id: string; asset: AssetId; version: VersionId; by: 'approver'; status: 'approved' | 'revoked'; reason: string | null }
export type Handoff = { id: string; kind: 'changes' | 'ready' | 'recalled'; note: string; by: 'reviewer' }
export type ReviewVersion = { id: VersionId; issues: Issue[]; stage: 'draft' | 'changes' | 'ready'; handoffs: Handoff[]; approvals: Approval[] }
export type ReviewAsset = { id: AssetId; active: VersionId; versions: ReviewVersion[] }
export type State = { schema: 1; revision: number; assets: ReviewAsset[] }
export type Context = { asset: AssetId; version: VersionId; role: Role }
export type Action =
  | { type: 'annotate'; anchor: Anchor; text: string }
  | { type: 'resolve' | 'reopen'; issue: string; note: string }
  | { type: 'changes' | 'handoff' | 'recall'; note: string }
  | { type: 'introduce' | 'approve' }
  | { type: 'withdraw'; note: string }
export const emptyVersion = (id: VersionId): ReviewVersion => ({ id, issues: [], stage: 'draft', handoffs: [], approvals: [] })
export const initialState = (): State => ({ schema: 1, revision: 0, assets: assets.map(a => ({ id: a.id, active: 'v1', versions: [emptyVersion('v1')] })) })
export const textLimit = 400
const record = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)
const keys = (x: Record<string, unknown>, expected: string[]) => Object.keys(x).sort().join('|') === [...expected].sort().join('|')
const bounded = (x: unknown): x is string => typeof x === 'string' && x.trim() === x && x.length > 0 && x.length <= textLimit
const idValid = (x: unknown): x is string => typeof x === 'string' && /^(issue|approval|handoff)-[1-9][0-9]{0,4}$/.test(x)
const recordRevision = (id: unknown): number => typeof id === 'string' ? Number(id.split('-')[1]) : 0
const ordered = (records: Record<string, unknown>[]) => records.every((r, i) => i === 0 || recordRevision(records[i - 1].id) < recordRevision(r.id))
export function validState(value: unknown): value is State {
  if (!record(value) || !keys(value, ['schema', 'revision', 'assets']) || value.schema !== 1 || !Number.isInteger(value.revision) || (value.revision as number) < 0 || (value.revision as number) > 10000 || !Array.isArray(value.assets) || value.assets.length !== 2) return false
  const revisions = new Set<number>()
  const uniqueId = (id: unknown, kind: string) => {
    if (!idValid(id) || !id.startsWith(`${kind}-`) || recordRevision(id) > (value.revision as number) || revisions.has(recordRevision(id))) return false
    revisions.add(recordRevision(id)); return true
  }
  return value.assets.every((a, index) => {
    if (!record(a) || !keys(a, ['id', 'active', 'versions']) || a.id !== assets[index].id || !Array.isArray(a.versions) || a.versions.length < 1 || a.versions.length > 2 || a.active !== (a.versions.length === 1 ? 'v1' : 'v2')) return false
    return a.versions.every((v, vi) => {
      const version = vi === 0 ? 'v1' : 'v2'
      if (!record(v) || !keys(v, ['id', 'issues', 'stage', 'handoffs', 'approvals']) || v.id !== version || !['draft', 'changes', 'ready'].includes(v.stage as string) || !Array.isArray(v.issues) || v.issues.length > 24 || !Array.isArray(v.handoffs) || v.handoffs.length > 48 || !Array.isArray(v.approvals) || v.approvals.length > 24) return false
      const issuesValid = v.issues.every(i => {
        if (!record(i) || !keys(i, ['id', 'asset', 'version', 'anchor', 'text', 'author', 'status', 'events']) || !uniqueId(i.id, 'issue') || i.asset !== a.id || i.version !== version || !anchors.includes(i.anchor as Anchor) || !bounded(i.text) || i.author !== 'reviewer' || !['open', 'resolved'].includes(i.status as string) || !Array.isArray(i.events) || i.events.length > 48) return false
        return i.events.every((e, ei) => record(e) && keys(e, ['kind', 'note']) && e.kind === (ei % 2 === 0 ? 'resolved' : 'reopened') && bounded(e.note)) && i.status === (i.events.length % 2 === 0 ? 'open' : 'resolved')
      })
      const handoffsValid = v.handoffs.every(h => record(h) && keys(h, ['id', 'kind', 'note', 'by']) && uniqueId(h.id, 'handoff') && ['changes', 'ready', 'recalled'].includes(h.kind as string) && bounded(h.note) && h.by === 'reviewer')
      const approvalsValid = v.approvals.every(p => record(p) && keys(p, ['id', 'asset', 'version', 'by', 'status', 'reason']) && uniqueId(p.id, 'approval') && p.asset === a.id && p.version === version && p.by === 'approver' && ((p.status === 'approved' && p.reason === null) || (p.status === 'revoked' && bounded(p.reason))))
      if (!issuesValid || !handoffsValid || !approvalsValid) return false
      const issues = v.issues as Record<string, unknown>[], handoffs = v.handoffs as Record<string, unknown>[], approvals = v.approvals as Record<string, unknown>[]
      if (!ordered(issues) || !ordered(handoffs) || !ordered(approvals)) return false
      // Each retained approval must have followed a ready handoff on this version.
      // A current approval must also follow the latest handoff, which revokes old approval.
      if (approvals.some(p => !handoffs.some(h => h.kind === 'ready' && recordRevision(h.id) < recordRevision(p.id)))) return false
      const currentApprovals = v.approvals.filter(p => record(p) && p.status === 'approved')
      const open = v.issues.some(i => record(i) && i.status === 'open')
      const last = v.handoffs.at(-1)
      return currentApprovals.length <= 1 && (currentApprovals.length === 0 || (v.stage === 'ready' && !open && record(last) && recordRevision(currentApprovals[0].id) > recordRevision(last.id) && currentApprovals[0] === approvals.at(-1))) && (v.stage !== 'ready' || (!open && record(last) && last.kind === 'ready' && issues.every(i => recordRevision(i.id) < recordRevision(last.id)))) && (v.stage !== 'changes' || (open && record(last) && last.kind === 'changes' && issues.every(i => recordRevision(i.id) < recordRevision(last.id))))
    })
  })
}
export function parseState(raw: string): State | null {
  try { const value: unknown = JSON.parse(raw); return validState(value) ? value : null } catch { return null }
}
export function versionFor(state: State, context: Pick<Context, 'asset' | 'version'>): ReviewVersion {
  const version = state.assets.find(a => a.id === context.asset)?.versions.find(v => v.id === context.version)
  if (!version) throw new Error('This asset version has not been introduced.')
  return version
}
const cleanText = (text: string) => { const value = text.trim(); if (!bounded(value)) throw new Error('Enter 1–400 characters.'); return value }
function revoke(v: ReviewVersion, reason: string) { for (const p of v.approvals) if (p.status === 'approved') { p.status = 'revoked'; p.reason = reason } }
export function transition(state: State, context: Context, action: Action): State {
  if (!validState(state)) throw new Error('Current state is invalid. Reset the sample to recover.')
  if (!roles.includes(context.role)) throw new Error('Choose a sample role.')
  if (state.revision >= 10000) throw new Error('Sample history limit reached. Reset to start again.')
  const next = structuredClone(state)
  const asset = next.assets.find(a => a.id === context.asset)
  if (!asset || asset.active !== context.version) throw new Error('Historical versions are read-only. Choose the active version.')
  const v = versionFor(next, context)
  const rev = state.revision + 1
  const requireRole = (role: Role) => { if (context.role !== role) throw new Error(`Switch to the simulated ${role} role for this decision.`) }
  const reviewerEdit = () => { requireRole('reviewer'); revoke(v, 'Review changed; a new handoff and approval are required.'); v.stage = 'draft' }
  switch (action.type) {
    case 'annotate':
      requireRole('reviewer')
      if (!anchors.includes(action.anchor)) throw new Error('Choose an anchor on this version.')
      if (v.issues.length >= 24) throw new Error('This version has reached its 24 issue limit.')
      reviewerEdit()
      v.issues.push({ id: `issue-${rev}`, asset: asset.id, version: v.id, anchor: action.anchor, text: cleanText(action.text), author: 'reviewer', status: 'open', events: [] })
      break
    case 'resolve': case 'reopen': {
      requireRole('reviewer')
      const issue = v.issues.find(i => i.id === action.issue)
      if (!issue || issue.status !== (action.type === 'resolve' ? 'open' : 'resolved')) throw new Error('This issue has changed. Review its current state.')
      if (issue.events.length >= 48) throw new Error('This issue has reached its recovery history limit.')
      const note = cleanText(action.note)
      reviewerEdit()
      issue.status = action.type === 'resolve' ? 'resolved' : 'open'
      issue.events.push({ kind: action.type === 'resolve' ? 'resolved' : 'reopened', note })
      break
    }
    case 'changes': case 'handoff': case 'recall': {
      requireRole('reviewer')
      if (v.handoffs.length >= 48) throw new Error('This version has reached its handoff history limit.')
      const open = v.issues.some(i => i.status === 'open')
      if (action.type === 'changes' && !open) throw new Error('Add an open issue before requesting a change.')
      if (action.type === 'handoff' && open) throw new Error('Resolve every open issue on this version before handoff.')
      if (action.type === 'recall' && v.stage === 'draft') throw new Error('There is no current handoff to recall.')
      const note = cleanText(action.note)
      revoke(v, 'Handoff changed; renewed exact-version approval is required.')
      v.stage = action.type === 'changes' ? 'changes' : action.type === 'handoff' ? 'ready' : 'draft'
      v.handoffs.push({ id: `handoff-${rev}`, kind: action.type === 'handoff' ? 'ready' : action.type === 'recall' ? 'recalled' : 'changes', note, by: 'reviewer' })
      break
    }
    case 'introduce':
      requireRole('owner')
      if (asset.active !== 'v1') throw new Error('The bundled replacement is already active.')
      asset.active = 'v2'; asset.versions.push(emptyVersion('v2'))
      break
    case 'approve':
      requireRole('approver')
      if (v.stage !== 'ready' || v.issues.some(i => i.status === 'open')) throw new Error('Approval needs a reviewer handoff and all current issues resolved.')
      if (v.approvals.some(p => p.status === 'approved')) throw new Error('This exact version already has approval.')
      if (v.approvals.length >= 24) throw new Error('This version has reached its approval history limit.')
      v.approvals.push({ id: `approval-${rev}`, asset: asset.id, version: v.id, by: 'approver', status: 'approved', reason: null })
      break
    case 'withdraw':
      requireRole('approver')
      if (!v.approvals.some(p => p.status === 'approved')) throw new Error('There is no current approval to withdraw.')
      revoke(v, cleanText(action.note)); v.stage = 'draft'
      break
  }
  next.revision = rev
  if (!validState(next)) throw new Error('The proposed decision violates the sample contract.')
  return next
}
