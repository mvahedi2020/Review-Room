# Review Room — keep the decision on the version

Review a design, leave feedback and approve the exact version you inspected. Replacing the design starts a fresh review so earlier approval cannot apply to unseen changes.

**The product choice:** Keep feedback and approval attached to the version actually reviewed. [Try the sample](https://mvahedi2020.github.io/Review-Room/) · [Follow the walkthrough](Sample_Walkthrough.md).

## User and decision

A campaign reviewer needs to know whether feedback and approval still apply after creative changes. The product choice is to attach each comment, handoff and approval to the exact media version and require independent review after any replacement.

The prototype makes that relationship visible in a media canvas, annotation rail and compact version strip. Two original fictional Northstar creatives have named owners and bundled v1/v2 SVGs. Reviewer and approver simulations show responsibility, while the UI states that anyone can switch roles and no real authority or identity enforcement exists.

A reviewer anchors a poster v1 issue to the details region and requests an enlarged date. The creative-owner simulation introduces bundled v2. The earlier issue stays on v1; v2 begins without feedback, handoff or approval. Reviewing and resolving a v2 issue enables handoff, then an approver preview explicitly names Night Garden v2. A separate regression approves v1 before replacement and shows that this historical approval never authorizes v2.

## Tradeoff and recovery

The conservative alternative tradeoff is extra review effort for minor replacements. Carrying one approval on an asset could reduce clicks but requires a reliable policy for which changes are exempt. The bounded sample chooses clarity of approval scope; it does not claim that policy has been validated with users.

Recovery follows the same product rule. Resolution preserves original comment identity and context. Reopening returns that issue to review and revokes current approval. Recalling a handoff or withdrawing approval preserves the decision history and requires fresh review. Reset clearly discards both local asset histories. Invalid saved state is retained until explicit reset; unavailable storage retains current confirmed memory and warns about refresh loss.

## Evidence and limits

Software verification and proposed user evaluation are recorded separately in [Validation](Validation.md). The [walkthrough](Sample_Walkthrough.md), [PRD](PRD.md) and [sample contract](Sample_Contract.md) explain the reproducible behavior. Source implementation and browser checks support a working demonstration; they do not establish usability, user acceptance or commercial outcomes.

Mo owns product and program direction. AI assists implementation and verification. The prototype uses no employer/customer media, real integrations, messaging, login or live AI.

## Next investment decision

Before relaxing approval for minor changes, ask reviewers and approvers to distinguish active and historical versions and explain which evidence authorizes each one. Compare the strict replacement rule with their current review method, recording repeat-review effort and any mistaken transfer of approval. If people understand the scope but redundant review dominates the task, test a clearly defined change policy in research before building exemptions. Production collaboration would require verified roles, asset provenance and an accountable approval policy. The role switcher and local history demonstrate the workflow without supplying that authority.
