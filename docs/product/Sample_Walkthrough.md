# Exact sample walkthrough

Use a freshly reset sample at `/Review-Room/`. All people, creative and decisions are fictional; confirmations change only this browser’s sample.

## Primary story

1. Open Night Garden: poster, owner Mira, v1 active. Keep Jules · Reviewer selected. Choose anchor 3 or **Add anchored issue**, choose **Details · lower left**, enter “Enlarge the date line.” Preview and **Confirm issue**.
2. **Request changes**; enter “Please enlarge the poster date.” Preview and confirm. The handoff identifies Night Garden v1 and directs the creative-owner simulation.
3. Switch to **Mira / Theo · Creative owner**. **Introduce bundled v2**, read the preview and **Confirm replacement**. Night Garden v2 is active, with larger date and clearer invitation. Its annotations, handoff and approval start empty.
4. Open **v1 Historical**: the original issue and change request remain attached to poster/v1/details. v1 is read-only. Return to **v2 Active**.
5. Switch to **Jules · Reviewer**. Add a details issue: “Check the revised date.” Preview/confirm. **Resolve with context**: “The larger date is readable.” Preview/confirm. The original text and anchor remain; history records resolution.
6. **Hand off v2**: “Inspected v2 headline, artwork and details.” Preview/confirm. Zero open issues plus a current ready handoff enable approver consideration.
7. Switch to **Ari · Approver**. **Approve v2**, inspect the exact “Night Garden v2” scope, and **Confirm approval of Night Garden v2**. Expand the version decision trail. Refresh: confirmed v2 approval remains; role resets to reviewer.

## Stale-approval regression

Reset both assets. As reviewer, inspect v1 and hand it off with a note. As approver, approve Night Garden v1. As creative owner, introduce v2. Choose v1 historical: its approval remains visible and is explicitly limited to v1. Choose v2: its approval is absent and approval is disabled until its own review/handoff. A superseded v1 cannot be approved again.

## Recover a deliberate mistake

On an active version, add an issue, resolve it with context, hand off and approve. As reviewer, **Reopen issue**, explain “Needs another check.” Preview and confirm. Original ID, asset/version, anchor, comment and resolution remain. Its approval is revoked, issue is open and handoff is blocked. Resolve again and hand off before any new approval. **Recall handoff** and **Withdraw approval** similarly preserve records; neither reinstates a previous approval.

Drafts and previews can be cancelled without changes. Switch assets, versions or roles to discard pending drafts. Escape cancels a native preview dialog; Tab/Shift+Tab remain within it. Confirmation moves focus to the status if its opener was removed or disabled.

Reset preview names both assets and all local confirmed history. Cancel keeps records; confirm restores original v1. Other browser keys are retained. This is intentionally irreversible and replaces only the sample’s saved key.

## Storage and concurrent-tab recovery

Refresh restores only validated confirmed decisions, not drafts/previews. For reproducible invalid state, in browser developer tools set `northstar-review-room-v1` to `{broken` and reload. The app preserves the bytes and disables review actions. Cancel reset and the bytes remain; explicitly confirm reset to replace them. If reset cannot save, invalid data is still preserved.

Simulate unavailable storage through the production browser tests described in [Validation](Validation.md). Getter/getItem/setItem failures are explained, current confirmed memory is retained and refresh may lose it. Confirmed memory can continue within the tab; the app does not claim cross-tab synchronization then.

In two same-origin tabs, start a preview in one and confirm an issue in the other. The pending preview is cancelled, and valid confirmed state appears. The suite also mutates stored content without incrementing its revision and without dispatching an event: confirmation rejects the stale action through full-content comparison.

For a v2 change request, guidance explicitly says no further replacement is bundled. Resolve/review the current issues or reset for a fresh sample. The companion banner has independent v1/v2 history and cannot reuse the poster’s comments.

Evidence and release gates are centralized in [Validation](Validation.md).
