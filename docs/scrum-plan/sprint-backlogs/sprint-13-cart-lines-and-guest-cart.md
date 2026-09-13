<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 13 — Cart: Lines & Guest Cart

**Canonical sprint:** [Sprint 13 — Cart: Lines & Guest Cart](../../sprint-backlogs/sprint-13-cart-lines-and-guest-cart.md)
**Lane:** Frontend · R1 · **Gate:** **`G6` — Contract Sync** · **Backend 20 pts · Frontend 13 pts**

---

## Sprint Goal

> **A guest can build a cart.**

"Guest" is the load-bearing word. A cart that only works for signed-in customers is a shorter sprint and a worse funnel — most carts begin before anyone has an account. So `EN-WIRE-4`'s cookie-based identity resolution is committed alongside the four line operations rather than after them, because retrofitting guest identity onto a customer-only cart means rewriting all four.

One rule threads through every story here: **the platform never silently changes what the customer asked for.** Not a capped quantity, not a dropped line, not an honoured stale price. Each exception flow below is a specific instance of it.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-CRT-01` | Add Item to Cart | 3 |
| FE | `US-CRT-02` | Update Cart Item Quantity | 3 |
| FE | `US-CRT-03` | Remove Item from Cart | 2 |
| FE | `US-CRT-04` | View Cart | 5 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *5* |
| | | **Frontend total** | **13** |

## Frontend Lane

> `/cart` is **R3** per [`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §4.2 — server-fetched on load, client cache for in-page editing only.

### `US-CRT-04` View Cart (5 pts) — `/cart`
- [ ] Server-fetched on load; `loading.tsx` skeleton in the shape of the line list
- [ ] **`E1` risen price, `E2` short stock and `E3` unpurchasable are three visibly distinct line treatments** — each states what changed, and none of them silently alters the line
- [ ] `E4` — the expired-cart empty state says the previous cart expired; it is not the generic "your cart is empty"
- [ ] Availability rendered through the Sprint 11 `EN-FE-DS-5` component, not a second implementation
- [ ] Hand-written Zod parsers for cart and cart-line payloads
- [ ] Vitest + axe across the normal, empty, expired, and three degraded line states

### `US-CRT-01` Add Item to Cart (3 pts) — `/p/[productId]`, `/cart`
- [ ] Add-to-cart from the product page; **availability never disables it** (`EN-FE-DS-5`), the server decides
- [ ] `ECP-CRT-4090` renders as "only N available" against **the line**, with the offer to add that quantity — never as a page-level error, and never as an automatic substitution
- [ ] `E2`/`E3` render their own designed outcomes, distinct from `E1`
- [ ] Vitest + axe

### `US-CRT-02` Update Cart Item Quantity (3 pts) — `/cart`
- [ ] **Optimistic quantity edits that revert visibly on failure** — normative in [`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §4.2. "Visibly" is the requirement: a silent revert is worse than no optimism
- [ ] `E1` — the revert restores the previous value and states the available quantity
- [ ] Rapid successive edits do not interleave into a wrong final quantity
- [ ] Vitest covering optimistic apply, revert-on-failure, and the rapid-edit sequence

### `US-CRT-03` Remove Item from Cart (2 pts) — `/cart`
- [ ] Removal is optimistic and reverts visibly on failure, same rule as quantity
- [ ] `E1` — an already-removed line resolves to the same end state without an error
- [ ] Vitest + axe

---

## Integration Risk & Dependencies


**Guest identity is the first thing in the plan that Prism cannot model.** The mock issues no guest cookie and enforces no ownership scoping, so every frontend cart path has been exercised against a backend that always says yes. `G6` is the first time cookie resolution, ownership scoping and the expired-cart path meet real behaviour.

Second: optimistic updates against a server that legitimately refuses (`ECP-CRT-4090` is a **normal** outcome, not an error) is the combination most likely to produce a UI that ends up out of step with the server. Check the revert, not just the happy path.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
