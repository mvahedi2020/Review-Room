import { initialState, parseState, transition, type Action, type Context, type State } from './domain'
export const storageKey = 'northstar-review-room-v1'
export type StoragePort = Pick<Storage, 'getItem' | 'setItem'>
export type StorageMode = 'saved' | 'memory' | 'invalid'
export type Session = { state: State; raw: string | null; mode: StorageMode; notice: string }
export type CommitResult = { session: Session; applied: boolean }
export const unavailableMessage = 'Browser storage is unavailable. Confirmed decisions stay in this tab only; refresh may lose them.'
export function loadSession(getStorage: () => StoragePort, previous?: Session): Session {
  try {
    const raw = getStorage().getItem(storageKey)
    if (raw === null) return { state: initialState(), raw, mode: 'saved', notice: 'Decisions are saved in this browser only.' }
    const state = parseState(raw)
    return state ? { state, raw, mode: 'saved', notice: 'Restored confirmed review decisions.' } : { state: previous?.state ?? initialState(), raw, mode: 'invalid', notice: 'Saved review data is invalid. It has been preserved. Reset the sample explicitly to replace it.' }
  } catch { return { state: previous?.state ?? initialState(), raw: previous?.raw ?? null, mode: 'memory', notice: unavailableMessage } }
}
export type Pending = { baseline: string; context: Context; action: Action | { type: 'reset' } }
export const previewDecision = (session: Session, context: Context, action: Pending['action']): { pending: Pending; next: State } => {
  if (session.mode === 'invalid' && action.type !== 'reset') throw new Error('Saved data is invalid. Reset the sample before making decisions.')
  return { pending: { baseline: JSON.stringify(session.state), context: { ...context }, action }, next: action.type === 'reset' ? initialState() : transition(session.state, context, action) }
}
export function commitDecision(session: Session, pending: Pending, context: Context, getStorage: () => StoragePort): CommitResult {
  if (pending.baseline !== JSON.stringify(session.state) || JSON.stringify(context) !== JSON.stringify(pending.context)) return { session: { ...session, notice: 'This preview is stale. Review the current asset, version and role before trying again.' }, applied: false }
  let storage: StoragePort | undefined
  let nextSession: Session
  try {
    storage = getStorage()
    const latest = storage.getItem(storageKey)
    if (latest !== session.raw) {
      const loaded = loadSession(() => storage!, session)
      return { session: { ...loaded, notice: loaded.mode === 'invalid' ? loaded.notice : 'Another tab changed this sample. Your pending decision was cancelled; review the updated state.' }, applied: false }
    }
    if (session.mode === 'invalid' && pending.action.type !== 'reset') return { session, applied: false }
    // Persistence can recover after a temporary failure. Compare its last known bytes first.
    nextSession = { ...session, mode: session.mode === 'invalid' ? 'invalid' : 'saved' }
  } catch {
    if (session.mode === 'invalid') return { session: { ...session, notice: 'Cannot reset preserved invalid data while storage is unavailable. Try again when storage works.' }, applied: false }
    nextSession = { ...session, mode: 'memory', notice: unavailableMessage }
    storage = undefined
  }
  let state: State
  try { state = pending.action.type === 'reset' ? initialState() : transition(session.state, context, pending.action) } catch (error) { return { session: { ...session, notice: error instanceof Error ? error.message : 'Decision rejected.' }, applied: false } }
  const serialized = JSON.stringify(state)
  if (storage) {
    try {
      storage.setItem(storageKey, serialized)
      return { session: { state, raw: serialized, mode: 'saved', notice: pending.action.type === 'reset' ? 'Both assets reset to their original v1 sample.' : 'Confirmed and saved in this browser.' }, applied: true }
    } catch {
      if (session.mode === 'invalid') return { session: { ...session, notice: 'Reset could not be saved. Invalid data remains preserved. Current memory is unchanged.' }, applied: false }
      return { session: { state, raw: session.raw, mode: 'memory', notice: unavailableMessage }, applied: true }
    }
  }
  return { session: { ...nextSession, state, notice: unavailableMessage }, applied: true }
}
