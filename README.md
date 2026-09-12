## ecommerce-frontend-next

The storefront and account frontend for the Enterprise Commerce Platform. See [`../docs`](../docs/) for the architecture and product documentation.

> Split out of the original `phuchoang2005/ecommerce` monorepo into its own repo under the `phuchoang-ecommerce-org` organization, with full git history preserved. Architecture/product/PM documentation, plus the shared OpenAPI contract used for codegen below, lives in the sibling [`docs`](https://github.com/phuchoang-ecommerce-org/docs) repo, pulled in here as a git submodule at `docs/` (see that repo's README). The `../docs/...` links below still reflect the old monorepo layout and will be repointed at the submodule path.

### Running it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Checks

```bash
npm run lint       # ESLint (boundaries, design-system, type-checked rules) + dependency-cruiser
npm run typecheck  # tsc --noEmit
npm run test       # Vitest — unit/component tests, axe, token-contrast
npm run test:e2e   # Playwright
npm run build      # typecheck + production build
```

### Layout

See [`Feature Structure.md`](../docs/SA-docs/03-frontend/Feature%20Structure.md) for the folder layout and import rules, and [`ADR-0022`](../docs/SA-docs/01-system/ADR/ADR-0022-ma-design-tokens.md) for the design tokens in `styles/theme.css`.
