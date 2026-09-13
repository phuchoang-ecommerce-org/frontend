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
