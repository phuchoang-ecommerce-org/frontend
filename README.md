## ecommerce-frontend-next

The storefront and account frontend for the Enterprise Commerce Platform. See [`../docs`](../docs/) for the architecture and product documentation.

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
