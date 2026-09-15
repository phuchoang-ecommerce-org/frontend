<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 07 — Catalog: Product Detail & Read Cache

**Canonical sprint:** [Sprint 07 — Catalog: Product Detail & Read Cache](../../sprint-backlogs/sprint-07-catalog-detail-and-cache.md)
**Lane:** Frontend · R1 · **Gate:** **`G3` — Contract Sync** · **Backend 18 pts · Frontend 20 pts**

---

## Sprint Goal

> **The product page is the reference implementation of `NFR-AVAIL-02`.**

**Approved pull-forward and scope boundary.** Sprint 07 includes variant
selection only: `?variant=<id>` is a shareable read-state and there is no cart
mutation or add-to-cart control. Cart writes, guest-cart identity, and cart
error handling remain exclusively Sprint 13 work. The active-promotion period
and unavailable-product category recovery are G3 contract-amendment
dependencies; estimates, `S07`, `G3`, and milestone dates are unchanged.

[`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §4.1 calls the product page's boundary layout **normative rather than incidental**. Four sections fail independently: product/variants/price takes the page down because it _is_ the page; availability, reviews and recommendations must not. Every later page that composes advisory sections copies what is built here, so getting the boundaries wrong now is a pattern that propagates, not a bug that stays local.

## Committed Frontend Work

| Lane | ID              |                                                                                               Item |    Pts |
| ---- | --------------- | -------------------------------------------------------------------------------------------------: | -----: |
| FE   | `US-CAT-03`     |                                                                               View Product Details |      8 |
| FE   | `US-CAT-04`     |                                                                             Select Product Variant |      3 |
| FE   | `EN-FE-SHELL-2` | `loading.tsx` / `error.tsx` / `not-found.tsx` placement and `<Suspense>` discipline per Routing §8 |      9 |
|      |                 |                                                                                 **Frontend total** | **20** |

## Frontend Lane

### `US-CAT-03` View Product Details (8 pts) — `/p/[productId]`, **R1**

- [x] **Four independent `<Suspense>` boundaries**, per [`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §4.1 — product/variants/price · availability · reviews · related. The page awaits only the first
- [x] Availability renders **labelled as advisory** and never disables add-to-cart — the binding check is at checkout
- [x] A failed reviews fetch renders a section-level empty state; a failed recommendations fetch removes the rail **silently**, with nothing said to the customer
- [x] `loading.tsx` skeleton in the shape of the page; each boundary carries its own fallback rather than one page-wide spinner
- [x] `not-found.tsx` for an unpublished/removed product that offers the containing category (`E1`) and does not explain why
- [x] Hand-written Zod parsers for the product, variant, and rating-summary payloads
- [x] Vitest + axe, including a test per boundary that asserts the _other three_ still render when it throws

### `US-CAT-04` Select Product Variant (3 pts) — `/p/[productId]`

- [x] Dimension selectors; partial selection shows the price range and keeps add-to-cart disabled (`A1`)
- [x] Non-existent and zero-stock combinations marked before selection (`A2`)
- [x] `E1` — an impossible combination keeps the rest of the selection intact rather than clearing it
- [x] Selection is URL state, so a variant is linkable and the page stays `R1`
- [x] Vitest + axe

### `EN-FE-SHELL-2` Boundary placement and `<Suspense>` discipline (9 pts)

- [x] `loading.tsx` / `error.tsx` / `not-found.tsx` placed per [`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §8 across **every** route group delivered so far, not only the new ones
- [x] The rule written down: a boundary exists per independently-fetched section, and a section that may fail without the page failing **must** have one
- [x] A lint or test-level check that a new route segment without a `loading.tsx` is caught in review rather than at a gate
- [x] Vitest + axe on the shared fallback components

**Boundary rule.** Every independently-fetched section owns a `<Suspense>`
boundary and shaped fallback. A section that may fail without the page failing
must catch and render its own designed degradation; route segments that fetch
need a `loading.tsx` in that segment or an ancestor.

---

## Integration Risk & Dependencies

**`getProductRatingSummary` returns an empty summary against the real API and a populated one against the mock, for seventeen sprints.** Like Sprint 05's `listOrders`, that difference is expected and must be recorded as expected at `G3`, not logged as drift. What is checked is the envelope, not the rows.

Second: `NFR-AVAIL-02` is asserted by _removing_ a dependency. If `G3` only exercises the happy path, the four-boundary layout is untested and the sprint's stated goal is unverified.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
