<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 16 — Promotion: Flash Sale & Lifecycle

**Canonical sprint:** [Sprint 16 — Promotion: Flash Sale & Lifecycle](../../sprint-backlogs/sprint-16-promotion-lifecycle.md)
**Lane:** Frontend · R1 · **Gate:** none · **Backend 21 pts · Frontend 10 pts**

---

## Sprint Goal

> **Promotions have a lifecycle.**

Sprint 15 made a voucher valid; this sprint makes it *stop* being valid — on a schedule, on command, and on reaching its limit. The asymmetry matters: `UC-PRM-04` `E4` and `UC-PRM-05` `E3` both describe a promotion that fails to deactivate, and both cost money **every minute** they persist. `BR-PRM-01` being re-evaluated at placement is what bounds that exposure, and it is the reason neither failure is catastrophic.

`EN-CONTRACT-1` is committed here at 13 points because there are now enough delivered operations for the spec→code direction to be worth automating — identity, catalog, search, inventory, cart and promotion. Doing it now means Sprints 17–25 inherit the harness rather than build it.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-PRM-01` | Create Promotion | 5 |
| FE | `US-PRM-04` | Launch Flash Sale | 3 |
| FE | `US-PRM-05` | Deactivate or Expire Promotion | 2 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *8* |
| | | **Frontend total** | **10** |

## Frontend Lane

### `US-PRM-01` Create Promotion (5 pts) — `/admin/promotions`, `/admin/promotions/new`, **R4**
- [ ] Reads `listPromotions`; writes `createPromotion`, `generatePromotionVouchers`, on the `EN-FE-DS-4` list → detail → action shell
- [ ] **`E2` — the form cannot submit without a usage limit**, and the server remains the authority. An unbounded promotion is unbounded discount exposure (`BR-PRM-01`)
- [ ] `E1` — a configuration that could go negative renders the declined outcome and the cap requirement; `E3` names the period problem; `E4` names the unsatisfiable condition
- [ ] Generated voucher codes are displayed once, for copying — and the screen says so. A code list re-fetchable forever is a wider surface than it needs to be
- [ ] Hand-written Zod parsers for promotion, condition and voucher payloads; `loading.tsx`; `<Suspense>` per independently-fetched section
- [ ] Vitest + axe

### `US-PRM-04` Launch Flash Sale (3 pts) — `/admin/promotions/[promotionId]`, **R4**
- [ ] `setPromotionStatus` as an action on the detail view
- [ ] The scheduled window is displayed with its **activation and deactivation state**, not just its dates — `E3` and `E4` are both "the schedule and reality disagree", and an operator can only notice that if both are shown
- [ ] `E5` — a limit reached before the window closes shows the sale as stopped with the reason, distinct from an expired one
- [ ] Vitest + axe

### `US-PRM-05` Deactivate or Expire Promotion (2 pts) — `/admin/promotions/[promotionId]`, **R4**
- [ ] `updatePromotion`, `setPromotionStatus` for manual deactivation — the operator's escape hatch for `E4`, so it must be reachable in one step from the detail view
- [ ] `E3` — a failed deactivation shows the promotion **still active** with the failure stated. Showing it as deactivated when it is not is the worst available outcome
- [ ] `E2` — the screen states that placed orders are unaffected, so no operator wonders whether they need to do something about them
- [ ] Vitest + axe

---

## Integration Risk & Dependencies


**`EN-CONTRACT-1` will find drift that six gates did not.** It exercises every delivered operation from the spec rather than from the paths the application happens to take, so optional fields never populated, status codes never returned, and schemas never exercised all surface at once — in a sprint with no gate to absorb them.

Budget for that inside the sprint rather than carrying it to `G8`. Findings are `openapi.yaml` amendments or code fixes, decided case by case, and each one is a drift log entry per [`ADR-0031`](../../../SA-docs/01-system/ADR/ADR-0031-contract-first-openapi.md).

Second: `US-PRM-05` `E5` is the first time the audit-failure branch **lets an action stand**. If Sprint 12 built only the refusal branch, this sprint discovers it.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
