<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 23 — Notification

**Canonical sprint:** [Sprint 23 — Notification](../../sprint-backlogs/sprint-23-notification.md)
**Lane:** Frontend · R1 · **Gate:** **`G11` — Contract Sync** · **Backend 21 pts · Frontend 13 pts**

---

## Sprint Goal

> **The platform tells people what happened.**

`notification` is a pure consumer — it subscribes to the Sprint 08 outbox's topics and owns no command path of its own. That shape decides its exception flows: **the business event it reports is never affected by a delivery failure.** `UC-NTF-01` `E7` and `UC-NTF-02` `E1` both say so explicitly, and `UC-ORD-05` `E9` said it first — an order is never reversed because its confirmation could not be composed.

The mirror rule is `BR-NTF-01`: a notification is **never marked delivered** when it was not. `E1` retries with backoff and then records **undeliverable**, surfaced operationally. This is `P6` in its most visible form — the customer who was never told.

This sprint also closes the escalation channel Sprint 20's `US-SHP-03` `E5` has been carrying without one.

**`R1` closes here.** Sprint 24 begins Release 2.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-RPT-01` | View Revenue Report | 5 |
| FE | `US-RPT-02` | View Product Performance Report | 3 |
| FE | `US-RPT-05` | View Order and Conversion Statistics | 5 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *5* |
| | | **Frontend total** | **13** |

## Frontend Lane

> All three stories are built against the mock. `reporting` arrives in **Sprints 26–27** — a three-sprint lead, the longest remaining in the plan.

### `US-RPT-01` View Revenue Report (5 pts) — `/admin/reports/revenue`, `/admin`, **R4**
- [ ] Reads `getRevenueReport`
- [ ] **`E1` — a period including today is marked explicitly incomplete, with its as-at time stated.** A partial day presented as a whole one produces a false decline every morning
- [ ] **`E2` — the as-at time is always stated; beyond the permitted lag (**[A-11]**) the figure is labelled stale rather than presented as current.** A figure of unknown age is worse than an acknowledged gap, because it will be acted on
- [ ] **`E5` — zero is presented explicitly and distinguishably from a computation failure.** "No revenue" and "we could not compute revenue" are different facts and must never look alike
- [ ] `E3` — a reporting outage renders its own screen, and **nothing about it touches checkout** (`P13`, `NFR-SCAL-05`)
- [ ] **No client-side arithmetic on `Money`** — every figure is server-computed
- [ ] Hand-written Zod parsers for the report payloads; each `/admin` dashboard card in its own `<Suspense>` boundary showing its own staleness ([`ADR-0036`](../../../SA-docs/01-system/ADR/ADR-0036-nextjs-server-sole-api-caller.md) §4)
- [ ] Vitest + axe across incomplete, stale, zero, and unavailable states

### `US-RPT-05` View Order and Conversion Statistics (5 pts) — `/admin/reports/orders`, `/admin`, **R4**
- [ ] Reads `getOrderStatisticsReport`
- [ ] **`E1` — where session data is unavailable, order statistics are shown and conversion marked unavailable.** A conversion rate from an unknown denominator is not a number worth showing
- [ ] `E2` — orders not yet terminal are counted in their current state **and identified as in flight**; counting them as completed overstates fulfilment
- [ ] Vitest + axe

### `US-RPT-02` View Product Performance Report (3 pts) — `/admin/reports/products`, **R4**
- [ ] Reads `getProductPerformanceReport`
- [ ] `E1` — a product removed during the period is **still reported** from the orders referencing it (`FR-DAT-04`); dropping it would understate the totals
- [ ] `E2` — unavailable view counts mark those columns unavailable and present the rest. **A partial report is useful; a silently incomplete one is not**
- [ ] `E5` — revenue is computed from **prices recorded on the orders**, not current catalog prices (`FR-DAT-03`, `BR-ORD-06`). The screen must not re-derive anything from a product lookup
- [ ] Vitest + axe

---

## Integration Risk & Dependencies


**`notification` has almost no contract surface** — two of its three stories are consumers with none at all — so `G11` verifies very little of what this sprint actually built. The guarantees that matter (recorded-before-sent, never-marked-delivered, duplicate-collapsed, business-event-unaffected) are verified by the sprint's own tests or not at all.

The concrete exposure: **`E4` duplicate collapse meets an at-least-once outbox.** If the idempotency key for a notification is derived from anything but the event id, a redelivery sends a second email — and the failure is invisible in every test that publishes each event once.

Second: three reporting screens are built against Prism for three sprints, and reporting is the domain where mock data is **least** representative — staleness, incompleteness and zero are the states that matter, and Prism generates none of them naturally. Exercise them by hand-editing mock responses.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
