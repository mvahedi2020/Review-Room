# Review Room

[Open the live demo](https://mvahedi2020.github.io/Review-Room/) · [Public source](https://github.com/mvahedi2020/Review-Room) · [Verified release evidence](docs/product/Validation.md)

Review a design, leave feedback and approve the exact version you inspected. Replacing the design starts a fresh review so earlier approval cannot apply to unseen changes. All records in this demo are fictional.

**Try it:** Add a comment to the sample poster, introduce its next version, and inspect which feedback and approvals still apply. [Open the demo](https://mvahedi2020.github.io/Review-Room/) · [Follow the walkthrough](docs/product/Sample_Walkthrough.md).

Mo owns the product direction and requirements. AI tools assisted implementation and verification.

Original vector campaign media, local simulated roles, no external collaboration or real approval authority.

[Product brief](docs/product/Product_Brief.md) · [Sample contract](docs/product/Sample_Contract.md) · [Validation and release gates](docs/product/Validation.md)

[Walkthrough](docs/product/Sample_Walkthrough.md) · [PRD](docs/product/PRD.md) · [Case study](docs/product/Case_Study.md) · [Decisions and risks](docs/product/Decisions_and_Risks.md)

Product tradeoff: requiring fresh approval on every replacement protects scope and adds review effort. The next investment depends on fewer mistaken approval transfers without disproportionate repeat work. See the [case study](docs/product/Case_Study.md) for the proposed comparison and investment criteria.

## Local use

Node 24 is required. Install locked dependencies with `npm ci`, run `npx playwright install chromium`, then `npm run build` and `npm run preview`. Open `http://127.0.0.1:4189/Review-Room/`.

Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm audit --audit-level=high`, `npm run test:e2e`.

## Evidence and limits

Dated software checks, proposed human evaluation and release provenance are centralized in [Validation](docs/product/Validation.md). Working review and recovery flows do not establish approval authority, customer acceptance or commercial impact. No human research has been conducted.

Read the [product documents](https://mvahedi2020.github.io/Review-Room/docs/index.html) in the styled reading guide. Canonical Markdown remains in `docs/`.
