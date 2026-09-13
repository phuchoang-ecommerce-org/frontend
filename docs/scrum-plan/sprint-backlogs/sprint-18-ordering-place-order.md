<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 18 — Ordering: Place Order (the Partnership)

**Canonical sprint:** [Sprint 18 — Ordering: Place Order (the Partnership)](../../sprint-backlogs/sprint-18-ordering-place-order.md)
**Lane:** Frontend · R1 · **Gate:** none · **Backend 18 pts · Frontend 10 pts**

---

## Sprint Goal

> **Placing an order is atomic across three modules.**

This is the **Order-Placement Partnership** — described in [`Module Dependency Diagram.md`](../../../SA-docs/02-backend/Module%20Dependency%20Diagram.md) §8 as *the single place in the system where one transaction spans three modules*, and the one boundary that is deliberately porous. `BR-ORD-02` requires creating the order, reserving its stock, and consuming the promotion's usage allowance to be indivisible **including under system failure**.

Two things keep that from becoming a general licence, and both are deliverables here: it goes through **`StockReservationPort` and `PromotionRedemptionPort`, never a direct call** — both owned by `ordering.application`, satisfied by adapters in `ordering.infrastructure` — and it is **scoped to this one interaction**. Every other cross-module edge stays a query or a one-time translation.

One 13-point story. `UC-ORD-05` carries ten exception flows, and **`E4`, `E5` and `E7` are the three that `P7` exists for**. This is the riskiest sprint in the plan and it is deliberately shielded: no gate at its end, and an 8-point frontend reserve behind it.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-ORD-07` | Track Order | 3 |
| FE | `US-ORD-08` | Cancel Order | 2 |
| FE | `US-ORD-10` | Advance Order Status | 5 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *8* |
| | | **Frontend total** | **10** |

## Frontend Lane

> All three stories are built against the Prism mock. The backend delivers them in **Sprint 19**.

### `US-ORD-10` Advance Order Status (5 pts) — `/admin/orders`, `/admin/orders/[orderId]`, **R4**
- [ ] Writes `advanceOrderStatus`, `advanceOrderStatusesInBulk`, `setOrderInvestigationFlag`; reads `listOrders`, `getOrder`, `listOrderLines`
- [ ] Built on the Sprint 12 `EN-FE-DS-6` discriminated union — **permitted transitions are exhaustive at compile time, and an unhandled state is a build failure, not a blank action bar**
- [ ] **`E1` — an illegal transition is declined for every role including `ADMINISTRATOR`**, showing the current state and the transitions available from it. `ECP-ORD-4091`. The state machine is a property of the platform, not a convention of one interface (`BR-ORD-01`, `P5`) — the UI must not offer a transition it believes an admin can force
- [ ] `E2` — authority is per transition: approving a refund and packing a box are different authorities (`P16`). Drawn controls follow the matrix; the server decides
- [ ] `E5` — a concurrent transition means the screen's state may be stale; a declined action re-reads and re-renders rather than insisting
- [ ] Bulk advance reports per-order outcomes — a bulk action that reports one aggregate result hides the `E1` failures inside it
- [ ] Vitest + axe, including a test asserting an unhandled status fails `npm run typecheck`

### `US-ORD-07` Track Order (3 pts) — `/account/orders/[orderId]/tracking`, **R3**
- [ ] Reads `trackOrder`
- [ ] **`E1` — when carrier updates are unavailable, the last recorded state is shown with when it was received. A stale state is never presented as current** (`NFR-AVAIL-02`)
- [ ] `E2` — an out-of-order carrier event does not move the shipment backwards (`BR-SHP-02`); the display reflects the latest state, not the latest message
- [ ] `E3` — another customer's order is `404`, and the screen does not explain why
- [ ] Vitest + axe, including the empty-history and stale-update states

### `US-ORD-08` Cancel Order (2 pts) — `/account/orders/[orderId]`, **R3**
- [ ] Writes `cancelOrder`
- [ ] **`E1` — an order already Packed or beyond is declined and the customer directed to a return** (`BR-ORD-04`). `US-ORD-09` is Sprint 31, so this sprint points at Support; record the forward link
- [ ] `E2` — an already-cancelled order reports success without acting again
- [ ] `E4` — an order cancelled but not refunded shows as **visibly awaiting refund**. The discrepancy is never closed by displaying it as refunded (`BR-PAY-02`, `P7`)
- [ ] `E5` — a cancellation that loses a race to a state advance declines as `E1`, and the screen re-reads rather than retrying
- [ ] Vitest + axe

---

## Integration Risk & Dependencies


**Nothing this sprint meets a gate, and that is intentional** — the partnership transaction is the last thing that should be rushed to meet one. The exposure is that `placeOrder` is exercised only by its own tests until `G9` at Sprint 19, then again, properly, at IH-2.

The concrete risk inside the sprint: **fault injection is easy to write shallowly.** Injecting a failure that the transaction was always going to roll back proves nothing. The four injection points must each be placed *after* the preceding step has genuinely applied, and each test must assert the absence of the order **and** the return of the stock — not just that an exception was thrown.

Second: `E6` and `E7` describe payment outcomes with no `payment` module behind them. The order states and the reservation hold are real this sprint; what drives them is not. Write down which half is built.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
