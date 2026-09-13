<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — IH-2 — Integration Hardening: The Money Path

**Canonical sprint:** [IH-2 — Integration Hardening: The Money Path](../../sprint-backlogs/ih-2-the-money-path.md)
**Lane:** Frontend · R1 · **Position:** after Sprint 20, before Sprint 21 · **No new stories · no story points**

---

## Goal

> **The money path — the sprint that decides whether `P6`, `P7` and `P8` are solved.**

That sentence is from [`../release-plan.md`](../release-plan.md) §4 and it is not rhetoric. Three of the platform's named risks converge here and nowhere else:

| | |
|---|---|
| **`P6`** | An accepted business event is silently lost, and the business operates on an incomplete picture without knowing it |
| **`P7`** | A transaction partially completes — a duplicate order, an unreleasable reservation, a capture with no record, an order marked refunded that was not |
| **`P8`** | Overselling under peak load, then cancelling confirmed orders afterwards — damaging the brand precisely during the event meant to build it |

IH-1 hardened session custody because it is hardest to retrofit. **IH-2 hardens the money path because it is the one whose failures cost money and cannot be apologised away.** Every row below is a property that no single sprint owns: Sprint 18 built placement, Sprint 19 the lifecycle, Sprint 20 shipment — and the guarantees run across all three.

Both developers, both lanes, full sprint. **No new stories, no points.** An IH sprint that takes on delivery work is an IH sprint that reports green because it ran out of time to look.

**One row is about a module that does not exist yet.** `payment` arrives in Sprint 21, so row 8's provider-callback verification and row 9's payment read model are examined against what Sprint 20 built — the carrier authenticity path and the outbox retention — and the payment-specific half is carried to IH-3. Say so in the row rather than passing it on a substitute.

---

## Frontend Verification Checklist

- [ ] Repeat with the same key and a **different** body: `ECP-ORD-4090`, reported as the client defect it is — never masked by minting a new key
- [ ] Drive it from the browser, not only from the test suite: double-click the place-order button, and confirm the frontend reused one key rather than minting two ([`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §4.3 rule 2)
- [ ] Four injection points, each placed **after the preceding step has genuinely applied**. Injecting where rollback was always going to happen proves nothing
- [ ] Drive a real shortfall through the browser and **look at the screen**. It says sold out. It does not say try again, and it is not the generic error boundary
- [ ] Put the two screens side by side — "sold out" and "try again" must be **visibly different outcomes to a customer**, not two strings in one layout
- [ ] Confirm the `(admin)` rendering of the same code on `adjustStock` is the adjustment-declined screen, not the storefront copy. **One code, two designed screens, routed by context**
- [ ] Make `placeOrder` time out. **No automatic retry fires** — assert on the server's request log, not on the UI
- [ ] The screen states the outcome is **unknown**, not that it failed. "Failed" is a claim the platform cannot make here
- [ ] Walk every funnel route — `/checkout`, `/checkout/shipping`, `/checkout/payment`, `/checkout/review`, `/checkout/payment/processing`, `/checkout/confirmation/[orderId]` — and inspect the response headers and the build output. **None is cached, none is static**
- [ ] Confirm no client cache holds funnel state across a navigation: change the cart in a second tab and confirm the funnel reflects it
- [ ] Confirm **nothing is optimistic** here, unlike `/cart` where it is required. A placement can be rejected after the customer has committed ([`ADR-0011`](../../../SA-docs/01-system/ADR/ADR-0011-optimistic-locking-reservation-model.md)), so an optimistic funnel lies
- [ ] The rendered screen does not distinguish "not yours" from "does not exist" — no wording, no status code, no timing difference
- [ ] Confirm `/api/internal/revalidate`'s signature check (IH-1 row 6) has not regressed
- [ ] **Record explicitly as carried to IH-3:** the payment provider callback itself, including that it terminates at `nginx` and never passes through `ecp-web`. Do not pass this row on the carrier substitute alone
- [ ] Drop a downstream read model and **rebuild it from the outbox alone**, using the Sprint 14 `EN-EVENT-4` replay path. It converges, and idempotency means the replay duplicates nothing
- [ ] Measure how long the rebuild takes. An unmeasured recovery path is one nobody will choose under pressure
- [ ] **`US-ORD-09` (Request Return) is Sprint 31.** `UC-ORD-08` `E1` directs a customer to a return path that is not built; confirm the decline is correct and the direction is honest about that

## Cross-Lane Milestones

- Complete the shared hardening exit criterion with the other lane.
- Record any unresolved finding as a sized canonical backlog item with a named sprint.
- See the [canonical hardening backlog](../../sprint-backlogs/ih-2-the-money-path.md) for the full system checklist.

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
