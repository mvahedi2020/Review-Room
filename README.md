# Review Room

[Open the live demo](https://mvahedi2020.github.io/Review-Room/) · [Public source](https://github.com/mvahedi2020/Review-Room) · [Verified release evidence](docs/product/Validation.md)

A fictional Northstar campaign review prototype. Feedback and approval belong to the exact asset version reviewed. Mo owns product and program direction; AI assists implementation and verification.

Original vector campaign media, local simulated roles, no external collaboration or real approval authority.

[Product brief](docs/product/Product_Brief.md) · [Sample contract](docs/product/Sample_Contract.md) · [Validation and release gates](docs/product/Validation.md)

## Local use

Node 24 is required. Install locked dependencies with `npm ci`, run `npx playwright install chromium`, then `npm run build` and `npm run preview`. Open `http://127.0.0.1:4189/Review-Room/`.

Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm audit --audit-level=high`, `npm run test:e2e`.

## Local verification — October 1, 2026

Fresh locked install, lint, strict types, **41 domain/storage tests**, production build and **20 production browser journeys** passed. Dependency audit found **0 vulnerabilities**. Desktop, 320px and 390px screenshots were inspected. Browser checks cover the full review/replacement/approval story, stale v1 approval, keyboard focus, cancellation, refresh and storage recovery.

[Walkthrough](docs/product/Sample_Walkthrough.md) · [PRD](docs/product/PRD.md) · [Case study](docs/product/Case_Study.md) · [Decisions and risks](docs/product/Decisions_and_Risks.md).

Exact software evidence, proposed human research and public release gates are centralized in [Validation](docs/product/Validation.md). No human research or commercial outcome is claimed.
