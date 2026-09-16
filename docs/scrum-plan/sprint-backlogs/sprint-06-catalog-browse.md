<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 06 — Catalog: Categories, Listings & Variants

**Canonical sprint:** [Sprint 06 — Catalog: Categories, Listings & Variants](../../sprint-backlogs/sprint-06-catalog-browse.md)
**Lane:** Frontend · R1 · **Gate:** none · **Backend 21 pts · Frontend 17 pts**

---

## Sprint Goal

> **The catalog is browsable.**

`identity` closed at Sprint 05, so `catalog` — the module twelve others read from — starts here. This sprint builds the two browse surfaces and the Redis cache-aside path underneath them; `NFR-PERF-01` is a property of that path, not of the controllers above it, which is why `EN-WIRE-3` is committed in the same sprint as the endpoints it serves rather than retrofitted after them.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-CAT-01` | Browse Category Tree | 5 |
| FE | `US-CAT-02` | Browse Category Product Listing | 5 |
| FE | `EN-FE-PERF-1` | R1 static generation + tag-based cache; web-vitals reporter | 7 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *1* |
| | | **Frontend total** | **17** |

## Frontend Lane

### `US-CAT-01` Browse Category Tree (5 pts) — `/` and `/c/[...slug]` navigation
- [x] Hand-written Zod parsers for `Category` and the tree response; reviewed, not generated
- [x] Category navigation renders the ancestor path for a deep link, and a category with no image renders on its name alone (`A2`)
- [ ] `E2` — a failed tree collapses the navigation to its empty state; search and featured entry points stay reachable
- [x] Vitest + axe

### `US-CAT-02` Browse Category Product Listing (5 pts) — `/c/[...slug]`, **R1**
- [ ] `/c/[...slug]` as an `R1` static route per [`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §4.1; **the product grid streams in its own `<Suspense>` boundary and the facet panel in another**
- [x] `loading.tsx` skeleton shaped like the grid — a fixed placeholder count, never a count read from a response that may be absent
- [x] Sort control writes to the URL, not to component state; changing it resets to the first page
- [x] Out-of-stock cards render the *marked* treatment, not a hidden or disabled one
- [ ] Empty category renders the designed empty state with sibling categories offered (`E1`)
- [ ] Vitest + axe on the grid, the card, and the empty state

### `EN-FE-PERF-1` R1 static generation + tag-based cache (7 pts)
- [ ] `generateStaticParams` for the category routes; tag-based `revalidateTag` keys that **match the backend's invalidation namespaces above**, agreed in this sprint rather than reconciled at `G3`
- [x] The tag scheme is the handoff point for `EN-FE-API-3` (Sprint 09) — record it where that sprint can read it
- [ ] Web-vitals reporter wired and reporting LCP/CLS/INP for the `R1` class
- [ ] Confirm the routes are genuinely static (build output shows them prerendered) — this is asserted at IH-1 row 7 and cheaper to establish now

**Cache-tag handoff (reconciled in Sprint 09):** `product:{id}`, `variant-price:{sku}`, and `category:{slug}` are the canonical shared namespaces. `{id}`, `{sku}`, and `{slug}` are the concrete product identifier, variant SKU, and affected category slug. The signed event callback maps catalog events to these tags as specified in [`Private Web Revalidation Callback v1`](../../Event%20Contract/web-revalidation.v1.md); frontend revalidation and `EN-FE-API-3` must use these namespace strings verbatim.

---

## Integration Risk & Dependencies


**The invalidation key scheme and the frontend cache-tag scheme are two names for one thing, owned by two people.** Nothing at `G3` will catch a mismatch, because both sides work correctly in isolation — the storefront simply never updates. Agree the exact key strings inside this sprint and write them down in one place, not two.

Secondary: `listCategoryProducts`'s cursor is the first list operation outside `identity`. If its envelope drifts from the Sprint 02 shape, every later list inherits the drift.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
