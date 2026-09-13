<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 21 — Payment: Authorise & Provider Callback

**Canonical sprint:** [Sprint 21 — Payment: Authorise & Provider Callback](../../sprint-backlogs/sprint-21-payment-authorise.md)
**Lane:** Frontend · R1 · **Gate:** **`G10` — Contract Sync** · **Backend 19 pts · Frontend 23 pts**

---

## Sprint Goal

> **Money can be taken.**

Every exception flow in `UC-PAY-02` and `UC-PAY-03` reduces to one discipline: **the platform never guesses what the provider did.** A timeout is not a decline (`E2`). A result that cannot be attributed is recorded as unmatched, never discarded (`E4`, `E2`). A result contradicting one already applied is escalated, never overwritten (`E4`) — deciding automatically which of two contradictory financial statements is true is precisely what human reconciliation is for.

Two structural facts shape the sprint. The **provider callback terminates at `nginx` and never passes through `ecp-web`** — it is a server-to-server path, not a browser one, and IH-2 row 8 deferred its verification to IH-3. And `/checkout/payment/processing` **polls**; the provider return is a route handler, not a page ([`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §4.3 rule 6).

The lane balance inverts this sprint — 23 frontend points against 19 backend, the first time the frontend carries more. It spends the surplus on `review` and `notification` screens whose backends are three sprints out.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-PAY-02` | Authorise Online Payment | 5 |
| FE | `US-PAY-03` | Handle Payment Gateway Result | 3 |
| FE | `US-REV-01` | Submit Product Review | 5 |
| FE | `US-REV-04` | View Product Reviews | 5 |
| FE | `US-NTF-03` | View In-App Notifications | 5 |
| | | **Frontend total** | **23** |

## Frontend Lane

### `US-PAY-02` Authorise Online Payment (5 pts) — `/checkout/payment/processing`, **R3**
- [ ] **The screen polls `getOrderPayment`** — case 3 of [`Data Fetching.md`](../../../SA-docs/03-frontend/Data%20Fetching.md) §5 — until the payment resolves. It is never cached and never optimistic
- [ ] Three terminal outcomes rendered distinctly: authorised · declined (`E1`, with retry offered) · **unresolved** (`E2`). **"Unresolved" is a designed state, not a spinner that never stops** — the customer is told the outcome is not yet known
- [ ] `E3` — an unreachable provider says to retry shortly, distinct from a decline
- [ ] **A timeout is never retried automatically**; one explicit retry, reusing the original `Idempotency-Key` ([`ADR-0023`](../../../SA-docs/01-system/ADR/ADR-0023-server-first-data-fetching.md) §4)
- [ ] No card detail is ever placed in a URL, a log, or an error message
- [ ] Hand-written Zod parsers for the payment payload; Vitest + axe across all four states

### `US-PAY-03` Handle Payment Gateway Result (3 pts) — the provider return handler
- [ ] **The provider return is a route handler, not a page** ([`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §4.3 rule 6). It verifies, then redirects to `/checkout/payment/processing`, which polls
- [ ] A return that fails verification redirects to the designed failure screen and **changes nothing**
- [ ] The handler is idempotent — a customer refreshing the return URL must not produce a second outcome
- [ ] Vitest over verify-and-redirect, forged-return, and repeated-return

### `US-REV-01` Submit Product Review (5 pts) — `/p/[productId]`, `/account/orders/[orderId]`, **mock-only**
- [ ] Writes `submitProductReview`, `addReviewImage`. `review` arrives **Sprint 24**
- [ ] **`E1` — a non-verified-buyer is declined, and `ECP-REV-4030`'s copy tells the caller to retry shortly rather than that they never bought the product** — the verified-purchase read model is eventually consistent ([`Error Codes.md`](../../../SA-docs/04-shared/Error%20Codes.md)). Getting this wording wrong accuses a real buyer of lying
- [ ] `E2` — an undelivered order says review becomes available after delivery; `E3` — an existing review offers amendment instead (`US-REV-02` is Sprint 32 — link honestly)
- [ ] **`E5` — a rejected image offers submitting the review without it** rather than losing the whole submission (`BR-REV-04`)
- [ ] `E6` — an unverified account offers a verification resend
- [ ] Vitest + axe

### `US-REV-04` View Product Reviews (5 pts) — `/p/[productId]`, **mock-only**
- [ ] Reads `listProductReviews`, `getProductRatingSummary`; writes `reportReview`
- [ ] **Renders into the advisory reviews boundary Sprint 07 built** — `E1`, reviews unavailable, is a **section empty state and never a page error** (`NFR-AVAIL-02`). Do not add a second boundary beside the existing one
- [ ] `E2` — a stale aggregate is acceptable and stated; no purchasing decision depends on it
- [ ] Cursor pagination through the Sprint 05 control
- [ ] Vitest + axe, including a test that a failing reviews fetch leaves the rest of the product page intact

### `US-NTF-03` View In-App Notifications (5 pts) — `/account/notifications`, **R3, mock-only**
- [ ] Reads `listOwnNotifications`; writes `setNotificationReadState`, `dismissNotification`, `markNotificationsRead`. `notification` arrives **Sprint 23**
- [ ] `E1` — no notifications renders an explicit empty list, never an error
- [ ] **`E3` — a failed read-state change still presents the notification content.** The customer's goal is met; the state change retries. A read-state failure never withholds the message
- [ ] `E4` — a notification referencing a deleted order or product presents **its recorded text**, and following it reports the target is no longer available (`FR-DAT-04`)
- [ ] The header bell shares one unread count with this screen — one source, not two
- [ ] Vitest + axe

---

## Integration Risk & Dependencies


**`G10` verifies the customer-facing half of payment and cannot verify the provider half.** The callback terminates at `nginx` from a real provider; the gate exercises `initiatePayment` and `getOrderPayment` and a simulated notification. **IH-2 row 8 already carried the real callback verification to IH-3** — `G10` must not be read as having closed it.

Second, and larger: **the unresolved-payment state is the hardest thing on the screen to test and the most expensive to get wrong.** `E2` produces an order that is neither paid nor failed, holding stock, waiting on a provider. Both lanes must exercise it deliberately — the backend by timing the provider out, the frontend by polling a payment that never resolves — because nothing in the happy path will produce it.

Third: three of the five frontend stories are mock-only for three more sprints (`review` Sprint 24, `notification` Sprint 23). That is the contract-first dividend, but `ECP-REV-4030`'s eventual-consistency wording is the kind of detail Prism cannot validate.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
