import { describe, expect, test } from 'vitest'
import { initialState, parseState, transition, validState, versionFor, type Action, type Context, type State } from './domain'
const ctx: Context = { asset: 'poster', version: 'v1', role: 'reviewer' }
const run = (state: State, action: Action, context = ctx) => transition(state, context, action)
const noted = () => run(initialState(), { type: 'annotate', anchor: 'details', text: 'Enlarge the date line.' })
const ready = () => run(initialState(), { type: 'handoff', note: 'Reviewed all three named regions.' })
const approved = () => run(ready(), { type: 'approve' }, { ...ctx, role: 'approver' })
describe('Independent finite story expectations', () => {
  test('seed explicitly identifies two owners/assets and only v1', () => { expect(initialState().assets.map(a => [a.id, a.active, a.versions.length])).toEqual([['poster', 'v1', 1], ['banner', 'v1', 1]]) })
  test('critical story keeps original issue origin after replacement then approves only v2', () => {
    let s = noted(); s = run(s, { type: 'changes', note: 'Please make the event date easier to read.' })
    s = run(s, { type: 'introduce' }, { ...ctx, role: 'owner' })
    const v2 = { ...ctx, version: 'v2' as const }
    expect(versionFor(s, ctx).issues[0]).toMatchObject({ id: 'issue-1', asset: 'poster', version: 'v1', anchor: 'details', status: 'open' })
    expect(versionFor(s, ctx).handoffs).toEqual([{ id: 'handoff-2', kind: 'changes', by: 'reviewer', note: 'Please make the event date easier to read.' }])
    expect(versionFor(s, v2).issues).toEqual([])
    s = run(s, { type: 'annotate', anchor: 'details', text: 'Check the larger date in v2.' }, v2)
    s = run(s, { type: 'resolve', issue: 'issue-4', note: 'The revised date is readable.' }, v2)
    s = run(s, { type: 'handoff', note: 'Reviewed v2 headline, artwork and details.' }, v2)
    s = run(s, { type: 'approve' }, { ...v2, role: 'approver' })
    expect(versionFor(s, v2).approvals).toEqual([{ id: 'approval-7', asset: 'poster', version: 'v2', by: 'approver', status: 'approved', reason: null }])
    expect(versionFor(s, ctx).approvals).toEqual([]); expect(s.revision).toBe(7)
  })
  test('approve v1 then introduce v2 never transfers approval or handoff', () => {
    const s = run(approved(), { type: 'introduce' }, { ...ctx, role: 'owner' })
    expect(versionFor(s, ctx).approvals[0]).toMatchObject({ version: 'v1', status: 'approved' })
    expect(versionFor(s, { ...ctx, version: 'v2' })).toMatchObject({ issues: [], handoffs: [], approvals: [], stage: 'draft' })
    expect(() => run(s, { type: 'approve' }, { ...ctx, role: 'approver' })).toThrow('Historical')
    expect(() => run(s, { type: 'approve' }, { ...ctx, version: 'v2', role: 'approver' })).toThrow('handoff')
  })
  test('resolution and reopen preserve origin/text and resolution history', () => {
    const original = versionFor(noted(), ctx).issues[0]
    let s = run(noted(), { type: 'resolve', issue: 'issue-1', note: 'Checked the details.' })
    s = run(s, { type: 'handoff', note: 'Ready.' }); s = run(s, { type: 'approve' }, { ...ctx, role: 'approver' })
    s = run(s, { type: 'reopen', issue: 'issue-1', note: 'Need another look.' })
    expect(versionFor(s, ctx).issues[0]).toEqual({ ...original, events: [{ kind: 'resolved', note: 'Checked the details.' }, { kind: 'reopened', note: 'Need another look.' }] })
    expect(versionFor(s, ctx).stage).toBe('draft'); expect(versionFor(s, ctx).approvals[0].status).toBe('revoked')
  })
  test('new review after approval revokes approval and requires renewed handoff', () => { const s = run(approved(), { type: 'annotate', anchor: 'headline', text: 'Review title.' }); expect(versionFor(s, ctx).approvals[0].status).toBe('revoked'); expect(versionFor(s, ctx).stage).toBe('draft') })
  test('handoff recall preserves event and invalidates approval', () => { const s = run(approved(), { type: 'recall', note: 'Review is incomplete.' }); expect(versionFor(s, ctx).handoffs.map(h => h.kind)).toEqual(['ready', 'recalled']); expect(versionFor(s, ctx).approvals[0].status).toBe('revoked') })
  test('withdrawal retains approval identity and reason', () => { const s = run(approved(), { type: 'withdraw', note: 'I need to reconsider.' }, { ...ctx, role: 'approver' }); expect(versionFor(s, ctx).approvals[0]).toMatchObject({ id: 'approval-2', status: 'revoked', reason: 'I need to reconsider.' }) })
  test.each([
    ['reviewer approval', ready(), { type: 'approve' }, ctx, 'approver'],
    ['approver annotation', initialState(), { type: 'annotate', anchor: 'headline', text: 'x' }, { ...ctx, role: 'approver' }, 'reviewer'],
    ['reviewer introduction', initialState(), { type: 'introduce' }, ctx, 'owner'],
    ['unreviewed approval', initialState(), { type: 'approve' }, { ...ctx, role: 'approver' }, 'handoff'],
    ['open issue handoff', noted(), { type: 'handoff', note: 'Ready' }, ctx, 'Resolve'],
    ['change without issue', initialState(), { type: 'changes', note: 'Change' }, ctx, 'open issue'],
    ['wrong issue reference', noted(), { type: 'resolve', issue: 'not-here', note: 'done' }, ctx, 'issue has changed'],
    ['empty note', noted(), { type: 'changes', note: '  ' }, ctx, '1–400'],
    ['oversized text', initialState(), { type: 'annotate', anchor: 'headline', text: 'x'.repeat(401) }, ctx, '1–400'],
  ] as [string, State, Action, Context, string][])('%s rejected without mutation', (_name, s, action, context, message) => { const before = JSON.stringify(s); expect(() => run(s, action, context)).toThrow(message); expect(JSON.stringify(s)).toBe(before) })
  test('banner cannot reuse poster issue ID or affect poster state', () => { const s = noted(); expect(() => run(s, { type: 'resolve', issue: 'issue-1', note: 'done' }, { ...ctx, asset: 'banner' })).toThrow(); const next = run(s, { type: 'annotate', anchor: 'artwork', text: 'Contrast.' }, { ...ctx, asset: 'banner' }); expect(next.assets[0]).toEqual(s.assets[0]); expect(next.assets[1].versions[0].issues[0].id).toBe('issue-2') })
  test('parse valid confirmed state and reject broken/malformed references', () => { expect(parseState(JSON.stringify(approved()))).toEqual(approved()); expect(parseState('{')).toBeNull(); const s = noted(); s.assets[0].versions[0].issues[0].version = 'v2'; expect(validState(s)).toBe(false) })
  test.each(['unknown-field', 'duplicate-id', 'active-not-latest', 'approval-with-open', 'resolved-without-history', 'missing-asset', 'bad-stage', 'handoff-missing', 'future-id', 'text-too-long'])('strict validation rejects %s', (problem) => {
    const s = approved(); const v = s.assets[0].versions[0]
    switch (problem) {
      case 'unknown-field': Object.assign(s, { unexpected: true }); break
      case 'duplicate-id': v.approvals.push(structuredClone(v.approvals[0])); break
      case 'active-not-latest': s.assets[0].active = 'v2'; break
      case 'approval-with-open': v.issues.push({ id: 'issue-1', asset: 'poster', version: 'v1', anchor: 'details', text: 'x', author: 'reviewer', status: 'open', events: [] }); break
      case 'resolved-without-history': v.issues.push({ id: 'issue-1', asset: 'poster', version: 'v1', anchor: 'details', text: 'x', author: 'reviewer', status: 'resolved', events: [] }); break
      case 'missing-asset': s.assets.pop(); break
      case 'bad-stage': Object.assign(v, { stage: 'unknown' }); break
      case 'handoff-missing': v.handoffs = []; break
      case 'future-id': v.approvals[0].id = 'approval-999'; break
      case 'text-too-long': v.handoffs[0].note = 'x'.repeat(401); break
    }
    expect(validState(s)).toBe(false)
  })
  test('finite issue limit is explained and repeated replacement rejected', () => {
    let s = initialState(); for (let i = 0; i < 24; i++) s = run(s, { type: 'annotate', anchor: 'artwork', text: `${i}` })
    expect(() => run(s, { type: 'annotate', anchor: 'artwork', text: 'extra' })).toThrow('24 issue')
    s = run(s, { type: 'introduce' }, { ...ctx, role: 'owner' }); expect(() => run(s, { type: 'introduce' }, { ...ctx, version: 'v2', role: 'owner' })).toThrow('already active')
  })
})
