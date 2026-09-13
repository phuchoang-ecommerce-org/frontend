<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 15 — Promotion: Vouchers & Redemption

**Canonical sprint:** [Sprint 15 — Promotion: Vouchers & Redemption](../../sprint-backlogs/sprint-15-promotion-vouchers.md)
**Lane:** Frontend · R1 · **Gate:** **`G7` — Contract Sync** · **Backend 21 pts · Frontend 13 pts**

---

## Sprint Goal

> **A voucher is validated and redeemed without over-redemption.**

`UC-PRM-02` `E7` is structurally the same problem as `BR-INV-01` and gets the same treatment: two customers redeem the last available use at once, **exactly one succeeds**, and the limit holds under concurrency. Over-redemption is unbudgeted spend, which is why `BR-PRM-01` is stated as an absolute rather than a target.

The second theme is **non-disclosure**. `UC-PRM-02` `E1` requires that "never existed", "expired" and "exhausted" be indistinguishable on the standalone validation endpoint, because that endpoint is an enumeration surface — the same reasoning behind Sprint 03's sign-in response and Sprint 05's password-reset response, arriving through a third door.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-ORD-03` | Apply Voucher at Checkout | 3 |
| FE | `US-ORD-04` | Review Order Summary | 5 |
| FE | `US-PRM-02` | Validate Voucher Code | 2 |
| FE | `US-PRM-03` | Apply Promotion to Order | 3 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *5* |
| | | **Frontend total** | **13** |

## Frontend Lane

> `/checkout/review` is **R3** — never cached, never optimistic ([`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §4.3). `placeOrder` is not built this sprint; `ordering` arrives in Sprint 17–18.

### `US-ORD-04` Review Order Summary (5 pts) — `/checkout/review`, **R3**
- [ ] Reads `getOrderSummary` against the mock; the funnel's final screen before placement
- [ ] **`E1` — a changed price shows the current value, states the change, and requires explicit re-confirmation.** The customer is never charged a price they were not shown (`BR-ORD-06`)
- [ ] `E2` — a line short of stock requires reduction or removal before continuing; the summary never reduces it for them
- [ ] `E3` — a voucher gone invalid is removed, **the total change is stated plainly with its reason**, and re-confirmation required
- [ ] `E4` — a changed shipping fee is shown and re-confirmed (`BR-SHP-01`)
- [ ] `E5` — every line unpurchasable ends checkout and returns to the cart with an explanation
- [ ] Re-confirmation is a real interaction, not a toast — the four cases above all converge on it, and it is the screen's actual job
- [ ] `loading.tsx`; hand-written Zod parsers for the summary payload; Vitest + axe across all five cases

### `US-ORD-03` Apply Voucher at Checkout (3 pts) — `/checkout/review`
- [ ] Writes `applyCheckoutVoucher`, `removeCheckoutVoucher`
- [ ] **`ECP-PRM-4090` fails the voucher field, never the checkout** — rule 5 of [`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §4.3, and check 6 of the integration plan exists largely for this case
- [ ] `E1`/`E2` render the non-disclosive copy exactly as the contract returns it. **The UI must not add a helpful explanation the API deliberately withheld** — that would reinstate the enumeration oracle at the presentation layer
- [ ] `E3` — an unmet condition **is** shown, because it is actionable; `E5` — a capped discount shows the capped value
- [ ] Vitest + axe, including one test asserting that the `E1` copy is identical across expired, exhausted and unknown codes

### `US-PRM-02` Validate Voucher Code (2 pts)
- [ ] The standalone `validateVoucher` path, sharing one component and one error map with `US-ORD-03` above
- [ ] Rate-limit `429` reuses the Sprint 04 screen
- [ ] Vitest

### `US-PRM-03` Apply Promotion to Order (3 pts) — `/checkout/review`, `/admin/promotions/[promotionId]`
- [ ] Discount lines rendered in the summary: which promotion, what it reduced, and — per `E2` — **which conflicting promotions were not applied**, since "recorded that the others were not applied" is only useful if the customer can see it
- [ ] `listPromotionRedemptions` on the admin promotion detail
- [ ] **No client-side arithmetic on `Money`.** Every displayed subtotal, discount and total comes from the server; this screen is where the temptation is greatest
- [ ] Vitest + axe

---

## Integration Risk & Dependencies


**The disclosure boundary is the risk, and it is a two-sided one.** The backend can leak by distinguishing causes; the frontend can leak by explaining a cause the backend withheld. Neither side's tests catch the other's leak. `G7` check 6 has to compare the **rendered copy** for expired, exhausted and unknown codes and confirm they are byte-identical — the same check Sprint 05 ran on password-reset messaging.

Second: `getOrderSummary` is mock-only for two more sprints, and it is the screen carrying every `Money` value in the funnel. Whatever Prism generates for discount and total shapes is unverified until `G8`.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
