# Decisions and risks

| Choice | Why | Alternative and cost |
|---|---|---|
| Any replacement needs renewed review | Approval scope remains explainable without a content-difference policy | Carry approval across cosmetic changes reduces effort but requires reliable classification and authority |
| Named region anchors | Keyboard and touch users can choose the same stable area | Arbitrary coordinates allow greater precision but need zoom/layout mapping and accessible equivalents |
| Keep original annotation identity | Resolution changes issue state, not origin | Moving comments to the latest version loses the reviewed context |
| Historical version is read-only | Prevent action on superseded media | Editing old records might help archival cleanup but confuses current decision scope |
| Reopen/recall/withdraw as scoped recovery | Each undo has visible consequences; approval is never automatically restored | Generic whole-state undo could silently restore superseded approvals |
| Reset both assets with explicit preview | Clears only the sample’s own saved key | Per-record destructive deletion adds ambiguity and can erase provenance |
| Simulated local roles | Demonstrates decision responsibility without services or personal data | Real access control requires a backend, verified identity and auditing |
| Full stored bytes compared before commit | Same-revision divergence is detected | Revision-only comparisons miss valid changed records at the same revision |
| Two bundled versions | The core story is reproducible with original media | Arbitrary uploads and v3+ introduce unsupported ingestion and storage needs |

Residual limits: local storage has no cross-tab atomic transaction, authenticated identity, server-side audit integrity or multi-device sync. A storage event cancels pending edits; a full comparison before commit also detects missed events. A simultaneous write between comparison and save remains outside this static sample’s guarantee. When storage cannot be read, cross-tab conflict detection is unavailable and the app explicitly operates in memory. A failed write keeps confirmed memory but refreshing may lose it.

Named anchors indicate regions rather than exact pixels; comments are not drawn as arbitrary coordinates. v2 can be reviewed and approved but has no bundled v3. Historical unresolved v1 issues remain visible as origin, without blocking the independent v2 review. An approver simulation is trusted to inspect media; the static sample cannot prove actual human comprehension.

No actual user study, business outcome or secure collaboration claim is made. All Northstar assets and people are fictional. Mo owns product/program direction; AI assists implementation/verification. Proposed research and release gates: [Validation](Validation.md).
