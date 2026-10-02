# Sample and state contract

All people and records are fictional. Night Garden (poster, owner Mira) and A little afterglow (banner, owner Theo) each begin with v1. Original repo-native SVG v2 media is bundled but appears only after the creative-owner simulation confirms introduction. Poster v2 enlarges the date and clarifies the invitation; banner v2 changes contrast and collection text. The active version is the most recently introduced version. This finite sample supports two versions per asset, not arbitrary uploads.

Comments name asset, version, headline/artwork/details anchor and reviewer. The anchor choices are keyboard accessible named regions; they are intentionally not arbitrary pixel coordinates. Comment text and notes accept 1–400 trimmed characters. A version allows 24 issues, 48 handoff events and 24 approval records; an issue allows 48 alternating resolution/reopen events. The overall revision cap is 10,000. A stated limit error requires reset if the user needs a fresh sample.

Roles: Jules reviews, Ari approves, Mira/Theo introduce the bundled creative. Anyone can switch these local simulations. There is no login or access-security claim. Reviewer handoff requires zero open issues; approval requires that current ready handoff, zero open issues, exact active asset/version and the approver simulation. Historical versions are read-only.

Every mutation has preview, cancel and confirm. An annotation or issue edit returns the current stage to review and revokes its approval. Resolution retains comment ID, original text, asset, version and anchor, appending the reason. Reopen undoes only the resolved status; it retains earlier resolution and requires a new handoff/approval. Recall undoes the current handoff, preserving its history and revoking approval. Withdrawal invalidates current approval; it never removes its record. Introducing v2 freezes v1 history, keeps v1 approval historical, creates empty v2 feedback and requires a new v2 handoff/approval. There is no automatic version rollback or transfer.

Reset discards both assets' local confirmed history and restores the original v1 gallery. Its preview names this scope; cancellation preserves everything. Individual comment deletion is intentionally unavailable to preserve origin.

Only validated confirmed state is stored under `northstar-review-room-v1`. Selection, role, drafts and previews are transient. Refresh opens the active poster with reviewer simulation and restores valid confirmed decisions. Invalid persisted state is preserved until an explicit reset. Storage access failure keeps current confirmed state in memory and warns that refresh may lose it. A full serialized comparison immediately before commit rejects cross-tab divergence even when revision numbers match. Version/asset/role changes and storage events invalidate previews and drafts. This is best-effort local browser storage, not a transactional collaboration backend.

Strict schema validation checks references, unique IDs, version order, active version, bounded text/history, alternating issue events, handoff prerequisites, and approval invariants. React renders free text as text. No external requests are part of the app.

See [Validation](Validation.md) for software evidence, proposed research and release gates.
