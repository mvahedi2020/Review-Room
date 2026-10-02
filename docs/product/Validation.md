# Validation

## Software verification

The sample is checked through independent expected domain transitions plus production browser journeys. It uses original fictional records. Software checks do not constitute a user study or demonstrate business impact.

Verified locally on **October 1, 2026 (America/Los_Angeles)** with Node 24.14.1:

- Fresh `npm ci`, lint and strict types passed. Types include source, production browser tests and tooling configurations.
- **41 domain/storage tests** passed in 2 files. Independent expected transitions cover version binding, wrong-role/unresolved/handoff gates, replacement after approved v1, resolution/reopen provenance, handoff recall, withdrawal, finite v2 changes, invalid references and bounded history. Storage cases cover invalid-data preservation, failed resets, getter/read/write failures, confirmed-only refresh and full-content same-revision divergence.
- Production build and runtime/environment/tracked-file guards passed. All 7 product documents are copied into `dist/docs/product`.
- Dependency audit: **0 vulnerabilities**, including zero high/critical.
- **20 production Playwright journeys** passed. Exact primary and stale-approval stories, cancellation, cross-tab invalidation, error/recovery, plain-text rendering and 320/390px overflow checks passed. Native modal plus explicit Tab/Shift+Tab boundaries, Escape cancellation, keyboard named-anchor use and meaningful post-confirmation focus passed.
- The monitored production media/docs journey reported no page/console errors and no external app requests; all 7 document responses contained Markdown and all original media loaded. This is a scoped software check, not an enterprise security assessment.

The first browser run found a keyboard-loop defect; explicit first/last-button boundaries corrected it, its targeted check passed, then all 20 production journeys passed. Primary source review also identified impossible v3 guidance after v2 changes; guidance now says no further bundled replacement exists, with domain/browser coverage for resolving and approving current v2. Confirmation now returns focus to a meaningful status when its opener was removed/disabled.


Manual visual verification uses agent-browser with installed Chrome and an owned session. Desktop and 390px agent-browser captures were inspected; full production captures at 1440px, 320px and 390px were also inspected. No visible clipping or horizontal page overflow was found. Browser processes and preview are stopped after verification.

Reproduce with Node 24: `npm ci`; `npx playwright install chromium`; `npm run lint`; `npm run typecheck`; `npm test`; `npm run build`; `npm audit --audit-level=high`; `npm run test:e2e`. Build includes these product documents. Preview uses only port 4189. Generated dependencies/build/test artifacts are ignored. Runtime/environment and tracked-file guards run before building.

## Proposed human evaluation — not performed

Recruit fictional-scenario reviewers and approvers only after a separate authorized research plan. Ask participants to identify the active version and owner, write a clear anchored change request, explain whether approved v1 authorizes v2, and recover a mistaken resolution. Observe correct version identification, requested-change clarity, approval-scope comprehension, recovery success and time/confusion points. A useful acceptance hypothesis is zero mistaken cross-version approvals in the task, but no observed rate, participant finding or commercial outcome is claimed.

Discuss with Mo whether every replacement needs approval and how to explain scope without overwhelming the reviewer. Mo’s personal comprehension and acceptance remain unobserved until that discussion occurs.

## Release gates

- Primary assistant independent source/claim and full-browser review, repair of any concrete findings.
- GitHub public repository and source head, successful “Verify and publish demo” Actions/Pages release, local/public head agreement and committed build/live-file parity.
- Public reviewer routes and profile links verified by the primary assistant.
- Actual discussion with Mo about the exact-version approval tradeoff and limits; personal comprehension cannot be inferred from software tests.

These are distinct from local software implementation. S033–S041 functionality and product artifacts map to the [PRD](PRD.md). S042 public publication and personal discussion must be recorded by their owner when actually verified.
