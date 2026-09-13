<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 28 — Audit Trail & Contract Completeness

**Canonical sprint:** [Sprint 28 — Audit Trail & Contract Completeness](../../sprint-backlogs/sprint-28-audit-trail-and-contract-completeness.md)
**Lane:** Frontend · R2 · **Gate:** none · **Backend 18 pts · Frontend 6 pts**

---

## Sprint Goal

> **The audit trail is searchable and append-only.**

The trail has been *written* since Sprint 12. Reading it is its own story, and `UC-AUD-01` `E3` fixes its shape: **amendment or deletion is refused for every role including `ADMINISTRATOR`, and the attempt is itself recorded as a security event.** An audit trail a sufficiently privileged actor can edit provides no assurance at all, which is why `BR-AUD-01` admits no exception.

So the deliverable is partly an absence. **No edit or delete control exists to draw — in the UI or the data model.** Not a hidden button, not an endpoint guarded by a role check. The capability does not exist.

`EN-CONTRACT-3` at 13 points is the larger item and the one that closes a promise made at every gate since `G0`. **The permission-matrix test is generated from spec × matrix across all 155 operations** — replacing eleven gates' worth of hand-walked check 7 and IH-1 row 9's recorded-coverage caveat with a suite. Testing Strategy §10's third coverage rule says why: *an uncovered cell is an unverified authorisation decision.*

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `EN-FE-PERF-2` | Per-route-class budget gate (ADR-0039) + Lighthouse CI | 6 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *12* |
| | | **Frontend total** | **6** |

## Frontend Lane

### `EN-FE-PERF-2` Per-route-class budget gate + Lighthouse CI (6 pts)
- [ ] **Budgets per route class, not one global budget** — [`ADR-0039`](../../../SA-docs/01-system/ADR/ADR-0039-frontend-performance-budgets-ci-gate.md). `R1` static routes, `R2` streamed, `R3` never-cached and `R4` admin have different honest ceilings, and one number for all four is a number that is wrong for three of them
- [ ] Build-failing, per [`ADR-0018`](../../../SA-docs/01-system/ADR/ADR-0018-architecture-governance-ci-gate.md)'s standing rule that gates are build-failing rather than review-failing — a build-failing gate cannot be negotiated with, which is the whole reason it is build-failing
- [ ] Lighthouse CI wired against the built application, reporting the web vitals `EN-FE-PERF-1` has collected since Sprint 06
- [ ] **The budgets are set from measured current values plus a stated margin**, not from aspiration. A budget nothing currently meets is a disabled budget within a fortnight
- [ ] Planted-regression demonstration, in the shape `EN-GATE-1` set in Sprint 01: add weight to an `R1` route, watch CI go red, remove it, watch it go green
- [ ] `R1` routes are confirmed genuinely static as part of the gate — IH-1 row 7 by hand, now automated

### Lane reserve — 12 pts
- [ ] The largest reserve remaining before Release 3. Spend it in §6's order: absorb backend slip first, then `EN-FE-E2E-3`'s Sprint 29 regression walk, then the design system and manual accessibility work
- [ ] Record at Review which purposes it went to

---

## Integration Risk & Dependencies


**`EN-CONTRACT-3` is the highest-yield item in the block and it will find things.** Eleven gates have walked permission-matrix cells by hand, IH-1 row 9 recorded explicitly that coverage was *"whatever was walked by hand"*, and 155 operations across a dozen roles is far more cells than any of those walks covered. Findings here are authorisation defects, not test defects, and each needs triage inside the sprint rather than a carry-forward — an unverified authorisation decision is the one class of finding that should not wait.

Budget deliberately for it. If the item runs long, the 12-point frontend reserve exists for exactly this.

Second: **no gate closes this sprint**, so `US-AUD-02` moves from mock to real without one. `/admin/audit` has been mock-served since Sprint 25 and integrates at `G14` next sprint — `E2`, `E3` and `E4` all being states Prism never generated.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
