<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 20 — Shipping: Quotes, Shipments & Delivery

**Canonical sprint:** [Sprint 20 — Shipping: Quotes, Shipments & Delivery](../../sprint-backlogs/sprint-20-shipping.md)
**Lane:** Frontend · R1 · **Gate:** none · **Backend 21 pts · Frontend 8 pts**

---

## Sprint Goal

> **Goods move and the customer can see it.**

`shipping` closes the two provisional edges the last three sprints have been carrying: `getShippingQuotes` has been an `ordering`-side placeholder since Sprint 17, and order-side tracking has had no carrier behind it since Sprint 19. Both become real here.

The theme running through every story is that **the platform never advances on an unconfirmed external fact**. `UC-SHP-03` `E2` and `E3`: a carrier rejection or an unreachable carrier leaves the order in Packed, because an order advanced on an unconfirmed dispatch misstates both fulfilment and revenue. `UC-SHP-06` `E4`: delivery is **never** taken as evidence of payment. And [`Error Codes.md`](../../../SA-docs/04-shared/Error%20Codes.md) §3.8 records that shipping defines **no domain-specific code of its own** — failures resolve to `GEN`, and an order-transition conflict on a shipment-driven change is `ECP-ORD-4091`, owned by `ORD` because the state machine is.

**IH-2 begins after this sprint.**

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-PAY-01` | Select Payment Method | 3 |
| FE | `US-SHP-03` | Create Shipment | 3 |
| FE | `US-SHP-06` | Confirm Delivery | 2 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *10* |
| | | **Frontend total** | **8** |

## Frontend Lane

### `US-SHP-03` Create Shipment (3 pts) — `/admin/shipments`, `/admin/shipments/[shipmentId]`, **R4**
- [ ] Reads `listShipments`, `getShipment`, `listShipmentTrackingEvents`; writes `createShipment`, on the `EN-FE-DS-4` shell
- [ ] `E1` — an order not in Packed renders `ECP-ORD-4091` with the current state and available transitions, not a generic error
- [ ] **`E2`/`E3` — a carrier rejection shows the reason and keeps the order visibly in Packed**, with retry and the alternative carrier offered. The screen must not imply the shipment was created
- [ ] `E4` — a shipment without a tracking reference renders as dispatched-and-flagged, distinct from not dispatched
- [ ] Hand-written Zod parsers for shipment payloads; `loading.tsx`; Vitest + axe

### `US-PAY-01` Select Payment Method (3 pts) — `/checkout/payment`, **R3**
- [ ] Reads `listEligiblePaymentMethods`; writes `selectCheckoutPaymentMethod`. Against the mock — `payment` arrives **Sprint 21**
- [ ] **`E1` — Cash On Delivery outside its configured conditions is not offered, and the reason is available if asked** (`BR-PAY-03`). Offering it and declining later wastes the customer's time at the worst moment
- [ ] `E2` — no eligible method renders the designed screen directing to Support. **The funnel never places an unpayable order**
- [ ] `E3` — a method that becomes unavailable before placement is reported at the summary and a new selection required (`UC-ORD-04`)
- [ ] Vitest + axe

### `US-SHP-06` Confirm Delivery (2 pts) — `/admin/shipments/[shipmentId]`, **R4**
- [ ] `confirmShipmentDelivery` as an action on the detail view
- [ ] `E2` — a duplicate confirmation reports success without implying the window restarted
- [ ] **`E4` — a delivered Cash On Delivery order with no collection recorded renders as Delivered-but-not-Paid**, visibly, and links to the outstanding-collection view. This is the screen that stops delivery being read as payment
- [ ] `E3` — a dispute is recordable from here without reversing the delivery
- [ ] Vitest + axe

---

## Integration Risk & Dependencies


**No gate closes this sprint, and IH-2 opens immediately after it.** Everything built here — carrier authenticity verification, the unmatched-update path, the Delivered-but-not-Paid state — goes straight into a hardening sprint that will examine the money path around it. That is the right order, but it means Sprint 20's Review is the **last chance to write down known gaps before they become IH-2 findings**.

The specific one to record: `US-SHP-06` `E4` produces a Delivered-but-not-Paid state with **no `payment` module to settle it**, and `US-SHP-03` `E5` escalates to an operational alert channel that does not exist until Sprint 23's notification work. Both are real states with absent drivers.

Second: `getShippingQuotes` replaces a provisional implementation that the frontend has been building against since Sprint 14. If the shape moved, three sprints of `/checkout/shipping` work moved with it — and there is no gate this sprint to catch it. Check it inside the sprint.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
