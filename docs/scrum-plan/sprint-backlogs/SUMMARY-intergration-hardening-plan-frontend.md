<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — IH-1 — Integration Hardening: Session & Catalog

**Canonical sprint:** [IH-1 — Integration Hardening: Session & Catalog](../../sprint-backlogs/ih-1-session-and-catalog.md)
**Lane:** Frontend · R1 · **Position:** after Sprint 09, before Sprint 10 · **No new stories · no story points**

---

## Goal

> **Session and catalog, end to end.**

This is not a Contract Sync gate and it is not a catch-up sprint. A gate checks the increment just delivered; IH-1 checks the **properties that no single increment owns** — session custody, boundary posture, the invalidation chain, and one correlation id running the length of it.

IH-1 sits first of the three hardening sprints because **session custody is the hardest thing in the plan to retrofit**. Every later sprint assumes it; if it is wrong, it is wrong everywhere at once.

Both developers, both lanes, full sprint. **No new stories are committed and no points are carried** — an IH sprint that takes on delivery work is an IH sprint that reports green because it ran out of time to look.

---

## Frontend Verification Checklist

- [ ] Sign in, then inspect every channel the browser can see: cookies, `localStorage`, `sessionStorage`, the HTML payload, every RSC flight response, and the network tab. **The access token appears in none of them**
- [ ] Confirm the same after a refresh and after a full page reload, not only on the first render
- [ ] Confirm no Server Action or route handler echoes the token into a response body or an error message
- [ ] Enumerate every cookie-authenticated write delivered so far — `(auth)`, `(account)`, `(admin)` — and replay each **without** the double-submit token. Every one is refused
- [ ] Capture the response headers for one route in **each** group and compare against the policy as written. A directive that was widened to make something work is the finding this row exists for
- [ ] Confirm the nonce is per-response, not per-build
- [ ] Confirm `(admin)` cookies carry `SameSite=Strict` and the storefront groups carry what the policy says they carry — not the same value copied across
- [ ] Sign in as a `CUSTOMER`, navigate to `/admin` and to three `(admin)` detail routes. **The shell renders**, its sections are empty, and every read behind it returned `403` **from the server**
- [ ] Confirm there is no redirect. A redirect here is threat `T9`: it turns the router into an oracle for which routes exist and which roles hold them
- [ ] Confirm the storefront was **not** revalidated directly by the admin write — stop the relay, take a write, and confirm the storefront does *not* update. One invalidation path, not two, and this is how that is proved
- [ ] Read the build output: `/`, `/c/[...slug]`, `/p/[productId]` are prerendered. A route that silently became dynamic — usually by reading a header or a cookie in a shared component — is the finding
- [ ] Fetch each `(account)` and `(admin)` route and confirm `noindex`
- [ ] Fetch the sitemap and confirm no `(account)` or `(admin)` path appears in it
- [ ] Issue one browser request that causes a catalog write, and follow **one** id through the API log, the outbox row, the Kafka envelope, the consumer, and the revalidation callback
- [ ] Confirm the id originates at the edge and is propagated, not regenerated at each hop — a fresh id per hop is indistinguishable from no id at all when it matters
- [ ] Hiding a control in the UI counts for nothing here. The check is the API response

## Cross-Lane Milestones

- Complete the shared hardening exit criterion with the other lane.
- Record any unresolved finding as a sized canonical backlog item with a named sprint.
- See the [canonical hardening backlog](../../sprint-backlogs/ih-1-session-and-catalog.md) for the full system checklist.

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
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
<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — IH-3 — Integration Hardening: Whole System

**Canonical sprint:** [IH-3 — Integration Hardening: Whole System](../../sprint-backlogs/ih-3-whole-system.md)
**Lane:** Frontend · R2 · **Position:** after Sprint 29, before Sprint 30 · **No new stories · no story points**

---

## Goal

> **The whole system, and an honest statement of what is still unverified.**

The second half of that sentence carries as much weight as the first. IH-1 hardened session custody because it is hardest to retrofit. IH-2 hardened the money path because its failures cost money. **IH-3 audits the whole system and then states plainly what it could not verify** — which is a deliverable, not a shortfall.

The `Must` cut line was Sprint 29. Every `Must` story is delivered and every enabler has landed. What remains is to check the properties that span all of them, and to write down, without softening, that **`AC-05` and `AC-06` are unverified** because the load rig they depend on is deliberately deferred ([`Testing and Benchmark Strategy.md`](../../../SA-docs/01-system/Testing%20and%20Benchmark%20Strategy.md) §7.9, with five dated triggers that end the deferral).

**Row 9 is the one row that passes by recording a failure.** A row 9 reported as "in progress" fails; a row 9 reported as "unverified" passes. That inversion is the entire point of this sprint, and it is the failure mode `P15` describes arriving through the last available door.

Both developers, both lanes, full sprint. **No new stories, no points.**

---

## Frontend Verification Checklist

- [ ] Walk **every row** of §12.1's requirement→test matrix. Not a sample, not the rows that changed recently — every row, with the evidence recorded against it
- [ ] Re-confirm IH-1's session rows have not regressed: no access token in the browser, CSRF on every cookie-authenticated write, refresh serialised
- [ ] Confirm the measured lag is what the screens **display** — the `asAt` an operator reads must be the real one, or `UC-RPT-01` `E2`'s honesty is cosmetic
- [ ] Confirm a figure past the bound is **labelled stale** end to end, from the projection through the API to the rendered screen
- [ ] Run scenarios S1–S5 against **stage 6's built image** — the `bootJar` on the same image versions, **not** a Gradle `bootRun` with dev tooling attached
- [ ] **Report only, never build-failing** (rule 3)
- [ ] All **40 rules**. Grep the suites for each `BR-` id and confirm a test names it — this is mechanical and should be a script, so it can be re-run rather than re-audited
- [ ] `AC-03` is `Reviewed, not tested` — it is a design review, not a suite, and saying otherwise would be the same failure in miniature
- [ ] Confirm the five triggers are still recorded and still current. A deferral whose triggers have quietly lapsed is an omission wearing a decision's clothes
- [ ] **IH-2 row 8, carried half** — the **real payment provider callback**, including that it terminates at `nginx` and never passes through `ecp-web`. IH-2 passed the row on the carrier substitute and deferred this deliberately. Close it under row 1 or re-log it with a named sprint
- [ ] **`EN-CONTRACT-3` findings** from Sprint 28 — authorisation defects, not test defects. Confirm each was triaged in-sprint as required, and that none was carried silently

## Cross-Lane Milestones

- Complete the shared hardening exit criterion with the other lane.
- Record any unresolved finding as a sized canonical backlog item with a named sprint.
- See the [canonical hardening backlog](../../sprint-backlogs/ih-3-whole-system.md) for the full system checklist.

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
