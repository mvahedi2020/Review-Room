# Review Room

A fictional Northstar campaign review prototype. Feedback and approval belong to the exact asset version reviewed. Mo owns product and program direction; AI assists implementation and verification.

Original vector campaign media, local simulated roles, no external collaboration or real approval authority.

[Product brief](docs/product/Product_Brief.md) · [Sample contract](docs/product/Sample_Contract.md) · [Validation and release gates](docs/product/Validation.md)

## Local use

Node 24 is required. Install locked dependencies with `npm ci`, run `npx playwright install chromium`, then `npm run build` and `npm run preview`. Open `http://127.0.0.1:4189/Review-Room/`.

Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm audit --audit-level=high`, `npm run test:e2e`.

The full walkthrough and current evidence are recorded in [Validation](docs/product/Validation.md).
