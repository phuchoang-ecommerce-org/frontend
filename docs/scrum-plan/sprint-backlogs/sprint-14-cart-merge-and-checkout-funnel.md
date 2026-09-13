<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 14 — Cart: Merge, Expiry & Checkout Funnel (FE)

**Canonical sprint:** [Sprint 14 — Cart: Merge, Expiry & Checkout Funnel (FE)](../../sprint-backlogs/sprint-14-cart-merge-and-checkout-funnel.md)
**Lane:** Frontend · R1 · **Gate:** none · **Backend 21 pts · Frontend 11 pts**

---

## Sprint Goal

> **A guest cart survives sign-in, and an abandoned one expires.**

`US-CRT-05` closes the loop Sprint 13 opened: guest identity is only worth having if it converts. `BR-CRT-03` is unusually explicit that a merged line is never silently discarded, and `E3` is unusually explicit that a merge failure must not deny a customer their account — a cart problem is never allowed to become a login problem.

The frontend lane starts the checkout funnel **three sprints before `ordering` exists**. That gap is the largest in the plan (§3.2) and it is deliberate: the funnel is the highest-value surface in the product and the one most worth having built, reviewed and revised before the endpoints behind it arrive.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-CRT-05` | Merge Guest Cart on Login | 3 |
| FE | `US-ORD-01` | Initiate Checkout | 3 |
| FE | `US-ORD-02` | Provide Shipping and Billing Information | 5 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *7* |
| | | **Frontend total** | **11** |

## Frontend Lane

> `US-ORD-01` and `US-ORD-02` are built entirely against the Prism mock. The backend delivers them in **Sprint 17**.

### `US-CRT-05` Merge Guest Cart on Login (3 pts) — the sign-in path
- [ ] The merge outcome is surfaced on arrival after sign-in: **which lines were dropped and why** (`E1`), and which are unpurchasable (`E2`)
- [ ] **`E3` — a merge failure does not block sign-in.** The customer lands signed in, with a message saying their earlier items will be recovered. Failing the sign-in screen here would be the exact inversion of the rule
- [ ] Vitest covering all three outcomes on the sign-in path

### `US-ORD-01` Initiate Checkout (3 pts) — `/checkout`, **R3**
- [ ] `/checkout` reading `initiateCheckout` and `getCurrentCheckout` per [`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §4.3
- [ ] **Nothing in this funnel is cached and nothing is optimistic** — rule 1 of §4.3, and it is easiest to honour by establishing it on the first screen
- [ ] `E1` empty cart, `E2` no purchasable line, `E3` some lines unpurchasable — three distinct screens. **`E3` requires the customer to explicitly remove or reduce; the funnel never silently drops a line from an order about to be paid for**
- [ ] `E4` unverified account offers a verification resend and **preserves the cart**; `E5` guest is sent to sign-in with a return path, guest cart preserved for merge
- [ ] `loading.tsx`; hand-written Zod parsers for the checkout payload
- [ ] Vitest + axe across all five outcomes

### `US-ORD-02` Provide Shipping and Billing Information (5 pts) — `/checkout/shipping`, `/checkout/payment`, **R3**
- [ ] `/checkout/shipping` — reads `getShippingQuotes`; writes `setCheckoutShippingAddress`, `selectCheckoutShippingOption`
- [ ] `/checkout/payment` — reads `listEligiblePaymentMethods`; writes `setCheckoutBillingInformation`, `selectCheckoutPaymentMethod`
- [ ] Addresses reuse the Sprint 05 `(account)` address schema and component — one `Address` shape, from `shared-kernel`, not a checkout-local copy
- [ ] `E1` — validation names **which field** is wrong; `E2` — an unserved destination says so plainly and offers another address rather than quoting a fee it cannot honour
- [ ] **`E3` — a fee that cannot be calculated blocks progress and offers retry. The UI never guesses a fee** (`BR-SHP-01`: the fee shown at confirmation is the fee charged)
- [ ] `E4` — changing the address after quoting **re-quotes** before the summary; a stale fee is never carried forward
- [ ] `E5` — lines that cannot ship to the destination are identified and must be removed or the address changed
- [ ] `loading.tsx` per segment; `<Suspense>` per independently-fetched section; Vitest + axe

---

## Integration Risk & Dependencies


**`US-ORD-01` and `US-ORD-02` will sit against the mock for three sprints** — the longest unverified stretch in the plan. Everything the funnel assumes about checkout state, shipping-quote shape and payment-method eligibility rests on Prism's generated examples until `G8` at Sprint 17.

The specific exposure is `getShippingQuotes`: `shipping` does not arrive until Sprint 20, so even at `G8` the quotes will be whatever `ordering` returns rather than what `shipping` eventually computes. Record that now so Sprint 17's gate does not mistake it for drift.

Second: `US-CRT-06` has no contract surface, so no gate will ever check it. Its `E1`/`E2` deferrals are the only thing standing between a housekeeping job and a customer stranded mid-checkout — they are verified here or not at all.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
