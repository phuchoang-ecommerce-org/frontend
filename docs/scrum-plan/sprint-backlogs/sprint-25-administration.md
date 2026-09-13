<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 25 — Administration: Accounts, Roles & Bulk Actions

**Canonical sprint:** [Sprint 25 — Administration: Accounts, Roles & Bulk Actions](../../sprint-backlogs/sprint-25-administration.md)
**Lane:** Frontend · R2 · **Gate:** **`G12` — Contract Sync** · **Backend 20 pts · Frontend 13 pts**

---

## Sprint Goal

> **Operators can run the business.**

`US-ADM-06` is the most consequential story in the plan by authority, not by points. **`E1` — an actor granting themselves a role they do not hold is refused and recorded as a security event**, because self-elevation would make every other access control in the system decorative. **`E2` — revoking the last `ADMINISTRATOR` is refused**, because a platform with no Administrator cannot be administered, including to undo that change. Both are `BR-AUD-03`.

`EN-CONTRACT-2` closes the second contract direction. Since Sprint 16 the spec→code direction has been automated and code→spec has been a manual confirmation at every gate. From this sprint on, **an undocumented endpoint fails the build** — which means `G12` is the first gate whose check 3 is machine-verified rather than asserted.

The frontend runs its Playwright suite against real endpoints for the first time.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-AUD-02` | Search Audit Trail | 5 |
| FE | `EN-FE-E2E-1` | Playwright purchase path — the whole thin suite | 8 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *5* |
| | | **Frontend total** | **13** |

## Frontend Lane

### `EN-FE-E2E-1` Playwright purchase path (8 pts)
- [ ] **The whole thin suite, and deliberately no larger** — register, browse, add to cart, check out, pay, confirm. One path, end to end, against real endpoints
- [ ] **First run against the real backend rather than Prism.** Everything the suite has assumed since Sprint 00's skeleton meets reality here
- [ ] Deterministic: no fixed sleeps, no reliance on a seeded database that a second run would corrupt, no ordering dependency between specs
- [ ] It must be able to fail. A suite that passes because it asserts nothing load-bearing is worse than none, since it consumes the confidence it does not earn
- [ ] What it deliberately does **not** cover is written down: concurrency, fault injection, and the money-path guarantees belong to the IH sprints, not here
- [ ] `EN-FE-E2E-2` (accessibility sweep, Sprint 27) and `EN-FE-E2E-3` (Release 2 regression walk, Sprint 29) extend this; keep the suite thin so they can

### `US-AUD-02` Search Audit Trail (5 pts) — `/admin/audit`, **R4, mock-only**
- [ ] Reads `searchAuditTrail`, `getAuditEntry`. `audit`'s **search** arrives in **Sprint 28** — the trail has been written since Sprint 12, but reading it is its own story
- [ ] `E1` — authority refused **and recorded**. The trail describes who exercised which authority and is itself sensitive (`P16`)
- [ ] **`E2` — no matching entries is presented explicitly and distinguishably from a failed search.** "No such action was recorded" and "the search did not run" are very different findings in an investigation, and they must not look alike
- [ ] **`E3` — an impractically large range asks the actor to narrow it.** The platform does not return a truncated set that could be mistaken for a complete one
- [ ] **`E4` — entries beyond the retention horizon are stated as unavailable**, rather than silently returning a partial record that reads as complete
- [ ] **`E5` — the trail is readable here, never writable.** No amend or delete control exists on this screen for any role (`UC-AUD-01` `E3`)
- [ ] Hand-written Zod parsers; `loading.tsx`; cursor pagination through the Sprint 05 control; Vitest + axe across all four states

---

## Integration Risk & Dependencies


**`G12` is the first gate whose check 3 is machine-verified**, and `EN-CONTRACT-2` may find undocumented endpoints that eleven gates of manual confirmation missed. Budget for that inside the sprint: each finding is either an `openapi.yaml` amendment or a route that should not exist, decided case by case, and each is a drift log entry per [`ADR-0031`](../../../SA-docs/01-system/ADR/ADR-0031-contract-first-openapi.md).

Second: **Sprint 24's review operations have no gate of their own.** They must be added to `G12`'s scope explicitly — the increment is nominally administration, and `review` would otherwise pass from mock to real without any gate looking at it.

Third: `EN-FE-E2E-1`'s first run against real endpoints is where accumulated mock assumptions surface all at once. Treat early failures as findings about the assumptions, not about the suite.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
