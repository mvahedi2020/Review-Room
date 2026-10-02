# Product requirements

**User:** a campaign reviewer preparing a specific creative version for approver consideration. **Decision:** which review evidence applies to which version, and when replacement requires renewed approval. Exact-version binding is the provisional recommendation; see [Product brief](Product_Brief.md) for the alternative and boundary.

| Acceptance work package | Required working behavior | Observable acceptance |
|---|---|---|
| S033 · Framing | Explicit user, problem, decision, non-goals and fictional boundary | Brief explains why all replacements need new approval and avoids employer outcomes |
| S034 · Contract | Two original assets, finite versions, state rules, distinct graphite/apricot canvas | Contract reproduces primary route, cancellation, errors and recovery; assumptions are stated |
| S035 · Foundation | Static React entry and real asset/version navigation | Scope and local simulation are visible; production build uses `/Review-Room/` |
| S036 · Asset review | Gallery, ownership, version labels, active and historical versions | Every action names asset/version; historical versions are read-only |
| S037 · Annotations | Named anchors, open/resolved issues, deliberate resolution and retained origin | No silent comment migration; resolve/reopen preserve original ID, text, version and anchor |
| S038 · Role review | Reviewer, creative-owner and approver simulation; visible requested changes and handoff | Next decision explains role; no real identity enforcement or secure enterprise claim |
| S039 · Approval | Explicit exact-version confirmation and replacement introduction | No approval on an unreviewed/superseded version; v1 approval remains historical when v2 is active |
| S040 · Recovery | Preview/cancel/confirm, valid refresh, invalid storage preservation, scoped reopen/recall/withdraw/reset | Stale actions do not commit; unavailable persistence is explained and current memory retained |
| S041 · Evidence | Keyboard focus, dialog, 320/390px layouts, announcements, exact walkthrough, product documents | Reproducible defects repaired; actual software evidence separated from proposed human research |
| S042 · Release and discussion | Consistent demo, case, contract and walkthrough; public head/live parity and reviewer route; discussion with Mo | Public checks and observed personal comprehension are separate gates; see [Validation](Validation.md) |

Reviewer annotation, resolution and reopening invalidate the current handoff and revoke current approval. Change request needs an open issue. Handoff needs no open issues plus a review note. Approval needs current ready handoff, no open issue and the simulated approver. New handoff, recall and withdrawal never restore an old approval. Replacement is a deliberate creative-owner preview; previous decisions remain frozen on their original version.

For v2 changes, no v3 is bundled: the next decision says to resolve/review current v2 issues or reset for a new sample. Reset names both assets and all local history, and does not touch unrelated browser keys. Bounded original vectors and local roles replace uploads, integrations and identity enforcement in this finite demonstration.

Persistence safeguards and exact limits are in [Sample contract](Sample_Contract.md). Software evidence, proposed research and release gates are centralized in [Validation](Validation.md).
