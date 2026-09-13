<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 17 — Ordering: Checkout Funnel

**Canonical sprint:** [Sprint 17 — Ordering: Checkout Funnel](../../sprint-backlogs/sprint-17-ordering-checkout-funnel.md)
**Lane:** Frontend · R1 · **Gate:** **`G8` — Contract Sync** · **Backend 18 pts · Frontend 10 pts**

---

## Sprint Goal

> **Checkout collects everything an order needs.**

`ordering` is the module with three cross-context edges, and every one of them now exists: `inventory` since Sprint 11, `cart` since Sprint 13, `promotion` since Sprint 16. This sprint builds the collection phase — nothing here reserves stock, redeems a voucher or takes money. Placement is Sprint 18, deliberately separated, because the partnership transaction deserves a sprint that is about nothing else.

`G8` is the gate the frontend has been waiting three sprints for: `/checkout` and `/checkout/shipping` were built in Sprint 14 and `/checkout/review` in Sprint 15, all against Prism. This is the **longest mock-only stretch in the plan**, and the gate is where it ends.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-ORD-05` | Place Order | 5 |
| FE | `US-ORD-06` | View Order Details | 5 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *8* |
| | | **Frontend total** | **10** |

## Frontend Lane

> Both stories are built against the Prism mock. `placeOrder` lands in **Sprint 18**, `getOrder` in **Sprint 19**.

### `US-ORD-05` Place Order (5 pts) — `/checkout/review`, `/checkout/confirmation/[orderId]`, **R3**
- [ ] **The `Idempotency-Key` is minted once per attempt and reused on any user-initiated retry — never regenerated.** Rule 2 of [`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §4.3, and regenerating it is exactly how a duplicate order happens
- [ ] **A timeout is never retried automatically.** The customer is told the outcome is unknown and offered **one explicit retry** (rule 3, [`ADR-0023`](../../../SA-docs/01-system/ADR/ADR-0023-server-first-data-fetching.md) §4)
- [ ] `ECP-ORD-4001` (key absent) and `ECP-ORD-4090` (key reused with a different body) are **client defects** — surfaced as such, never masked by silently minting a new key
- [ ] **`ECP-INV-4091` renders as "sold out", visibly different from "try again"** (rule 4). This is the single most-repeated requirement in the source documents and IH-2 row 4
- [ ] `ECP-PRM-4090` fails the voucher field, not the checkout (rule 5)
- [ ] Nothing on this screen is cached and nothing is optimistic (rule 1)
- [ ] `/checkout/confirmation/[orderId]` reads `getOrder`, `listOrderLines`
- [ ] Vitest + axe across placement success, sold-out, voucher-exhausted, timeout, and duplicate-submission paths

### `US-ORD-06` View Order Details (5 pts) — `/account/orders/[orderId]`, **R3**
- [ ] Reads `getOrder`, `listOrderLines`; the `(account)` group's never-cached posture from Sprint 05
- [ ] **`E1` — another customer's order returns `404` and the screen never explains why.** The group `not-found.tsx` Sprint 05 built already implements this; `notFound()` on a `404 ApiProblem` rather than a per-segment copy
- [ ] `E2` — an order referencing a deleted product presents **in full from the values recorded at placement** (`FR-DAT-04`). A catalog change never rewrites a purchase record
- [ ] **`E3` — the placement price is shown, not the current one** (`BR-ORD-06`, `FR-DAT-03`). The order detail is the one screen that must *not* reuse the storefront's current-price rendering
- [ ] Order status rendered through the Sprint 12 `EN-FE-DS-6` discriminated union
- [ ] Hand-written Zod parsers for order and order-line payloads; `loading.tsx`; Vitest + axe

---

## Integration Risk & Dependencies


**Three sprints of frontend checkout work meet a real backend for the first time at `G8`.** `/checkout`, `/checkout/shipping`, `/checkout/payment` and `/checkout/review` were all built against Prism's generated examples. Everything they assume about checkout state shape, re-confirmation semantics and summary composition is unverified until the gate.

The specific trap: **`getShippingQuotes` is provisional this sprint** and `listEligiblePaymentMethods` has no `payment` module behind it until Sprint 21. Both will return contract-shaped placeholders. Record them as expected at `G8` rather than logging them as drift — and record equally that the *shapes* are what the gate checks, not the values.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
