<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 31 — Release 3: Cart, Orders & Personalisation

**Canonical sprint:** [Sprint 31 — Release 3: Cart, Orders & Personalisation](../../sprint-backlogs/sprint-31-cart-orders-personalisation.md)
**Lane:** Frontend · R3 · **Gate:** **`G15` — Contract Sync** · **Backend 21 pts · Frontend 15 pts**

---

## Sprint Goal

> **Wishlist, returns, delivery estimates, and personalisation.**

The last five `Should` stories, and the one that closes a loop left open since Sprint 13: **`US-ORD-09` Request Return.** `UC-CRT-01` `E3` has offered the wishlist since Sprint 13 without one existing; `UC-ORD-08` `E1` has directed customers to a return path since Sprint 19 without one existing. Both forward references become real here, and both files recorded them honestly rather than pretending otherwise — this sprint is where that bookkeeping pays off.

Two rules shape the wishlist stories, and both are about **not destroying intent**. `UC-CRT-08` `E1` — an out-of-stock item **stays on the wishlist**, which is exactly where an out-of-stock item belongs. `E3` — if adding to the cart fails, the wishlist entry is **not** removed: ordering the steps this way means a failure costs the customer nothing, and the reverse order would lose the saved intent.

And `US-SCH-07`'s rail is the one place an `R1` route contains dynamic content — **worth naming rather than discovering**, as [`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §4.1 puts it.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-SCH-07` | Receive Personalised Recommendations | 3 |
| FE | `US-CRT-07` | Manage Wishlist | 5 |
| FE | `US-CRT-08` | Move Wishlist Item to Cart | 2 |
| FE | `US-ORD-09` | Request Return | 3 |
| FE | `US-SHP-02` | Estimate Delivery Date | 2 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *3* |
| | | **Frontend total** | **15** |

## Frontend Lane

### `US-CRT-07` Manage Wishlist (5 pts) — `/wishlist`, **R3**
- [ ] `CUSTOMER` only; **a `GUEST` reaching it is redirected to sign-in with a return path** ([`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §4.2) — the one place in the plan where a redirect is the designed behaviour rather than the `T9` mistake, because this is authentication, not authorisation
- [ ] `E1` — an unavailable entry is **marked, not hidden**
- [ ] `E2` — a guest adding from a product page is sent to sign-in and **the item is saved on return**, not lost
- [ ] Availability through the Sprint 11 `EN-FE-DS-5` component; `loading.tsx`; hand-written Zod parsers
- [ ] Vitest + axe

### `US-ORD-09` Request Return (3 pts) — `/account/orders/[orderId]/return`, **R3**
- [ ] Reads `getOrderReturnRequest`; writes `requestOrderReturn`. The admin resolution path is `/admin/orders/[orderId]/return` with `resolveOrderReturn`
- [ ] **`E1`/`E2` render as distinct designed screens** — a passed window states when it closed; an undelivered order links to cancellation
- [ ] `E3` — an existing request is **shown**, and the form is not offered a second time
- [ ] **`E5` — a return awaiting refund is shown as awaiting refund**, never as settled — the same treatment Sprint 18 gave `UC-ORD-08` `E4`
- [ ] **Update the Sprint 18 cancel screen**: `UC-ORD-08` `E1` has pointed at Support since then and can now point at this route
- [ ] Vitest + axe

### `US-SCH-07` Receive Personalised Recommendations (3 pts) — `/`, **R2 inside the R1 shell**
- [ ] **The one place an `R1` route contains dynamic content** ([`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §4.1). The rail streams into its own boundary as a dynamic section inside a static page
- [ ] **For a `GUEST` the rail is not rendered at all**, so the page stays wholly static
- [ ] **Not above the fold, and the shell never awaits it** — either would make the whole route dynamic and forfeit exactly what [`ADR-0019`](../../../SA-docs/01-system/ADR/ADR-0019-nextjs-app-router-rendering-strategy.md) §4 made it static for, and what `P1`'s LCP budget depends on
- [ ] `E1` — unavailable falls back to trending or **disappears silently**
- [ ] Confirm against `EN-FE-PERF-2`'s budget gate that the home page's `R1` class still passes
- [ ] Vitest + axe

### `US-CRT-08` Move Wishlist Item to Cart (2 pts) — `/wishlist`
- [ ] **`E1`/`E3` — a failed move leaves the item visibly on the wishlist.** The optimistic pattern from Sprint 13 applies, and the revert must be visible
- [ ] `E4` — a risen price is stated on arrival in the cart, reusing the Sprint 13 treatment
- [ ] Vitest + axe

### `US-SHP-02` Estimate Delivery Date (2 pts) — `/checkout/shipping`, **R3**
- [ ] The estimate renders beside the quote; **`E1` — its absence changes nothing else on the screen** and never blocks progress
- [ ] `E2` — a revised estimate shows the revision **with the original still visible**
- [ ] Vitest + axe

---

## Integration Risk & Dependencies


**`G15` is the last Contract Sync gate**, and after it only Sprint 32's Release Readiness Review remains. Anything not caught here is caught by a review whose job is to state status, not to find defects.

The specific exposure: `US-ORD-09` and `US-CRT-07` close forward references that have been recorded in Sprint 13's and Sprint 19's files for eighteen and twelve sprints respectively. The copy on those older screens still points at the old destination — Support, or a wishlist that did not exist. **Updating them is part of this sprint**, and nothing in the gate checklist will notice if it is skipped.

Second: `US-SCH-07` is the one dynamic section inside a static page. Get it wrong and the home page silently becomes dynamic — which `EN-FE-PERF-2`'s budget gate should catch, but only if the budgets were set tightly enough in Sprint 28 to distinguish the two.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
