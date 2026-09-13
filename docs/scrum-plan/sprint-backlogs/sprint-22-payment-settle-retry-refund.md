<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 22 — Payment: Settle, Retry & Refund

**Canonical sprint:** [Sprint 22 — Payment: Settle, Retry & Refund](../../sprint-backlogs/sprint-22-payment-settle-retry-refund.md)
**Lane:** Frontend · R1 · **Gate:** none · **Backend 20 pts · Frontend 21 pts**

---

## Sprint Goal

> **Money can be settled, retried, and given back.**

This sprint closes the states earlier sprints created but could not resolve: Sprint 19's Cancelled-but-not-Refunded, Sprint 20's Delivered-but-not-Paid, Sprint 21's Payment Failed with the reservation held. Each was built deliberately as a visible discrepancy rather than a hidden one, and each gets its resolution here.

**`US-PAY-06` is where the audit rule inverts.** `UC-PAY-06` `E7` is the canonical `UC-AUD-01` `E2` case: a refund whose audit entry cannot be written **stands**, because the customer's money has already moved and reversing it would be worse — and the missing entry is escalated immediately as a compliance exception. Sprint 12 built that branch specifically for this story. Select it; do not write a second one.

`/admin/payments` is `listUnmatchedPayments` — **the one admin list that should be empty in normal operation**, and its empty state says so.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-PAY-04` | Settle Cash On Delivery Payment | 2 |
| FE | `US-PAY-05` | Retry Failed Payment | 3 |
| FE | `US-PAY-06` | Process Refund | 3 |
| FE | `US-ADM-03` | Manage Customer Accounts | 5 |
| FE | `US-ADM-04` | Manage Orders | 5 |
| FE | `US-ADM-06` | Manage User Roles | 3 |
| | | **Frontend total** | **21** |

## Frontend Lane

> `US-ADM-03`, `US-ADM-04` and `US-ADM-06` are built against the mock. The backend delivers them in **Sprint 25**.

### `US-PAY-06` Process Refund (3 pts) — `/admin/payments`, `/admin/payments/[paymentId]`, **R4**
- [ ] Reads `listUnmatchedPayments`, `getPayment`, `listPaymentAttempts`, `listPaymentRefunds`; writes `refundPayment`
- [ ] **`/admin/payments` is the one admin list that should be empty in normal operation, and its empty state says so** — [`UI Design System.md`](../../../SA-docs/03-frontend/UI%20Design%20System.md) §13's "the design at rest", not "no data"
- [ ] `E1` — `ECP-PAY-4220` renders the maximum refundable; `E6` — reason is required by the form and the server remains the authority
- [ ] **`E3`/`E4` — a failed or pending refund shows the obligation as still outstanding.** Never as settled
- [ ] Vitest + axe

### `US-PAY-05` Retry Failed Payment (3 pts) — `/checkout/payment/processing`, **R3**
- [ ] `retryPayment` from the processing screen, reusing the Sprint 21 poll
- [ ] `E1` — a passed window explains the cancellation and offers the cart again, **stating that availability may have changed**
- [ ] `E3` — a rate-limited retry reuses the Sprint 04 `429` screen rather than inventing one
- [ ] **`E5` — the screen never recalculates the total.** Whatever it shows is what the server fixed at placement
- [ ] Vitest + axe

### `US-PAY-04` Settle Cash On Delivery Payment (2 pts) — `/admin/payments/[paymentId]`, **R4**
- [ ] `settleCashOnDelivery` as an operator action
- [ ] **`E2` — a differing collected amount is recordable, and the screen does not mark the order Paid.** The discrepancy is shown as a discrepancy
- [ ] `E3` — the outstanding-collection view is reachable from here
- [ ] Vitest + axe

### `US-ADM-03` Manage Customer Accounts (5 pts) — `/admin/customers`, **R4, mock-only**
- [ ] Reads `searchAccounts`, `getAccount`; writes `correctAccountProfile`, `setAccountStatus`, `closeAccount`, `endAccountSessions`
- [ ] **`E2` — credentials are never displayed to any role.** Passwords exist only as one-way hashes and are not retrievable (`NFR-SEC-02`, `NFR-SEC-07`). The screen must not have a field for them
- [ ] `E3` — a suspension without a recorded reason cannot be submitted (`BR-AUD-01`)
- [ ] **`E4` — suspending an account with open orders blocks access but the screen states that open orders continue to be fulfilled.** The platform does not abandon a paid order because an account was suspended (`P7`)
- [ ] Vitest + axe

### `US-ADM-04` Manage Orders (5 pts) — `/admin/orders`, **R4, mock-only**
- [ ] Reads `listOrders` (scoped); writes `advanceOrderStatusesInBulk`. Extends the Sprint 18 order screens rather than duplicating them
- [ ] **`E1` — an illegal transition is declined for every role including `ADMINISTRATOR`**, via the `EN-FE-DS-6` union. `ECP-ORD-4091`
- [ ] **`E3` — amending a placed order's contents or total is not offered at all.** Once Paid, terms are fixed; the remedies are cancellation, return and refund, each leaving a record (`BR-ORD-06`, `P17`)
- [ ] `E4` — an order that changed while being inspected re-evaluates and declines as `E1` if no longer legal
- [ ] Bulk advance reports **per-order** outcomes
- [ ] Vitest + axe

### `US-ADM-06` Manage User Roles (3 pts) — `/admin/roles`, **R4, mock-only**
- [ ] Reads `listRoles`, `listAccountRoles`; writes `grantAccountRole`, `revokeAccountRole`
- [ ] **`E1` — self-elevation is refused and recorded as a security event.** Self-elevation would make every other access control decorative (`BR-AUD-03`, `P16`)
- [ ] **`E2` — revoking the last `ADMINISTRATOR` is refused.** A platform with no Administrator cannot be administered, including to undo this change
- [ ] `E4` — a reason is required. Privilege changes are the first thing an auditor examines (`P17`)
- [ ] The UI may not pre-empt `E1`/`E2` by hiding controls — **the server is the authority and its refusal must be renderable**
- [ ] Vitest + axe

---

## Integration Risk & Dependencies


**No gate closes this sprint, and it carries the plan's highest-consequence write.** `refundPayment` moves money outward, its audit branch is the inverted one, and nothing checks it against the frontend until `G11` at Sprint 23. The `E7` path — audit fails, refund stands, exception escalated — must be exercised deliberately inside the sprint, because it cannot occur by accident.

Second: six frontend stories land in one 21-point lane, three of them against a backend three sprints away. The `(admin)` surface is now large enough that the Sprint 09 rule matters again — **a `CUSTOMER` reaching any of these routes sees the shell and server-side `403`s, never a redirect** (IH-1 row 5, `Security.md` T9). Re-check it here rather than at `G12`.

Third: `EN-OBS-3` asserts a property that has been true by demonstration since IH-1. If it has decayed, this is where that is discovered — and the fix belongs in this sprint, not logged forward.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
