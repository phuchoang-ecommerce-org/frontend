<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 24 — Review

**Canonical sprint:** [Sprint 24 — Review](../../sprint-backlogs/sprint-24-review.md)
**Lane:** Frontend · R2 · **Gate:** none · **Backend 18 pts · Frontend 11 pts**

---

## Sprint Goal

> **Customers can review what they bought.**

**This is the first Release 2 sprint.** Everything from here to Sprint 29 completes the `Must` set; the purchase path closed at Sprint 23.

`BR-REV-01` — only verified buyers may review — is the story, and `UC-REV-01` `E1` states it the same way `UC-ORD-10` `E1` states the order state machine: **it holds whatever entry point the request arrives through and whatever role the caller holds.** An `ADMINISTRATOR` cannot author a review for a product they did not buy, because the rule is a property of the platform rather than a convention of the storefront (`P5`).

The subtlety is in the error copy. `ECP-REV-4030`'s description in [`Error Codes.md`](../../../SA-docs/04-shared/Error%20Codes.md) is explicit: **the verified-purchase read model is eventually consistent, so the response tells the caller to retry shortly rather than that they never bought the product.** Wording it the other way accuses a real buyer of lying, minutes after they bought something.

And the product page's reviews section has been an advisory boundary since Sprint 07 — **a review outage is a section empty state, never a page error** (`NFR-AVAIL-02`). Sprint 07 built the boundary against an empty summary; this sprint puts real rows behind it without changing that contract.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-RPT-04` | View Inventory Report | 3 |
| FE | `EN-CI-3` | Frontend CI stages: type check, lint, boundary + cycle check, codegen drift | 8 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *7* |
| | | **Frontend total** | **11** |

## Frontend Lane

### `EN-CI-3` Frontend CI stages (8 pts)
- [ ] Type check, lint, **boundary + cycle check** (ESLint boundaries + dependency-cruiser), and **codegen drift** as pipeline stages — the gates that have existed since Sprint 00 now enforced outside a developer's machine
- [ ] **Codegen drift fails the build**: regenerate from `openapi.yaml` and fail on a non-empty diff. This is gate check 1 automated, and after this sprint a stale `openapi.d.ts` cannot reach a gate
- [ ] Non-skippable, per [`ADR-0018`](../../../SA-docs/01-system/ADR/ADR-0018-architecture-governance-ci-gate.md) — and fast enough that nobody wants to skip it, which §5 names as how the gate actually fails
- [ ] Demonstration, in the shape `EN-GATE-1` set in Sprint 01: **plant a boundary violation and a drifted type, watch CI go red, remove them, watch it go green.** The demonstration is the deliverable
- [ ] The backend's equivalent stages are `EN-CI-1` (Sprint 27) and `EN-CI-2` (Sprint 29) — this item covers the frontend lane only

### `US-RPT-04` View Inventory Report (3 pts) — `/admin/reports/inventory`, `/admin`, **R4, mock-only**
- [ ] Reads `getInventoryReport`. `reporting` arrives **Sprint 27**
- [ ] **`E1` — the as-at time is stated.** No decision made from this report consumes stock; `UC-INV-01` re-checks at the moment of reserving (`UC-INV-05` `E3`)
- [ ] `E2` — a SKU with no configured reorder threshold appears in the position report and is **listed as unconfigured rather than silently omitted**
- [ ] **`E4` — a reporting outage leaves the operational inventory view (`/admin/inventory`, Sprint 12) available.** Warehouse work cannot stop for a reporting outage (`NFR-AVAIL-02`) — and the screen should say where to go
- [ ] Vitest + axe

---

## Integration Risk & Dependencies


**No gate closes this sprint.** `review` reaches the frontend at `G12` in Sprint 25, where the increment is nominally administration — so the review operations must be added to `G12`'s scope explicitly or they will be checked by nobody.

The specific exposure is `ECP-REV-4030`'s copy. The frontend wrote it in Sprint 21 against a mock that returns the code with no description; the backend writes the real description now. **Two people have independently decided what a refused review says to a real buyer**, and only a deliberate comparison will catch a mismatch.

Second: `getProductRatingSummary` has returned a designed empty summary since Sprint 07 — seventeen sprints. Every product-page test written since then encodes that empty shape. Real rows arriving is the moment those assumptions surface.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
