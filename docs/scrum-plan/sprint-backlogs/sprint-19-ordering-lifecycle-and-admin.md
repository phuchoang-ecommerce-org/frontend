<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 19 — Ordering: Lifecycle & Admin Orders

**Canonical sprint:** [Sprint 19 — Ordering: Lifecycle & Admin Orders](../../sprint-backlogs/sprint-19-ordering-lifecycle-and-admin.md)
**Lane:** Frontend · R1 · **Gate:** **`G9` — Contract Sync** · **Backend 19 pts · Frontend 7 pts**

---

## Sprint Goal

> **An order has a life after placement.**

`US-ORD-10` at 8 points is the order state machine, and it is the sprint's centre of gravity. `BR-ORD-01` makes it **a property of the platform rather than a convention of one interface** — an `ADMINISTRATOR` cannot move an order from Draft to Delivered, and an administrative interface that could skip transitions would be exactly the loophole `P5` describes.

Two exception flows encode the whole discipline and pull in opposite directions: **`E3` — a failed side effect means the transition does not occur**, because a Processing → Packed that fails to commit the reservation leaves stock the platform thinks it still holds. **`E6` — a failed event leaves the transition standing**, because a dropped event means a downstream process silently misses a shipment. State and side effect move together; state and *notification of state* do not.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-SHP-01` | Calculate Shipping Fee | 2 |
| FE | `US-SHP-05` | View Shipment Tracking | 5 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *11* |
| | | **Frontend total** | **7** |

## Frontend Lane

> Both stories are built against the Prism mock; the backend delivers them in **Sprint 20**. The 11-point reserve is the largest in the plan and absorbs Sprint 18 slip.

### `US-SHP-05` View Shipment Tracking (5 pts) — `/account/orders/[orderId]/tracking`, **R3**
- [ ] Reads `getShipment`, `listShipmentTrackingEvents`
- [ ] **`E1` — no updates yet: the screen states the shipment is dispatched and awaiting the first carrier update.** An empty history is explained, never left blank
- [ ] **`E2` — the age of the last update is stated explicitly.** A stale status presented as current is worse than no status, because the customer acts on it
- [ ] `E3` — a shipment the caller may not see returns the same outcome as one that does not exist. **A tracking reference identifies a real address and must not be probeable** (`P16`)
- [ ] Events render in recorded order, with an out-of-order event visible in the history but not advancing the headline state (`BR-SHP-02`)
- [ ] Hand-written Zod parsers for shipment and tracking-event payloads; `loading.tsx`; Vitest + axe across empty, stale, and out-of-order histories

### `US-SHP-01` Calculate Shipping Fee (2 pts) — `/checkout/shipping`, **R3**
- [ ] Quote display refactored onto the real `getShippingQuotes` shape, replacing the Sprint 14 mock-shaped implementation
- [ ] **`E3` — the UI never estimates a fee.** A failure is stated and retry offered (`BR-SHP-01`)
- [ ] `E4` — a fallback rate, where one exists, is **identified as a fallback**; `E1`/`E2` reuse the Sprint 14 unserved-destination and restricted-line screens
- [ ] Vitest + axe

---

## Integration Risk & Dependencies


**`placeOrder` and the whole order lifecycle meet the frontend at `G9`, one sprint after the partnership was built and one sprint before IH-2 examines it properly.** The gate will exercise the happy path and the documented error codes; it will not exercise fault injection, concurrency, or idempotency under load. Those are IH-2 rows 1, 2 and 3, and `G9` must not be read as having covered them.

Second: `US-ORD-08` `E4` and `US-ORD-10` `E3` both depend on modules that are partly absent — `payment` until Sprint 22, `shipping` until Sprint 20. Both produce **real states with no real driver** this sprint. Record precisely which half is built, or Sprint 20–22 will re-litigate it.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
