<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 29 — Release 2 Stabilisation

**Canonical sprint:** [Sprint 29 — Release 2 Stabilisation](../../sprint-backlogs/sprint-29-release-2-stabilisation.md)
**Lane:** Frontend · R2 · **Gate:** **`G14` — Contract Sync** · **Backend 21 pts · Frontend 8 pts**

---

## Sprint Goal

> **Release 2 is stabilised and the event backbone is proved under failure.**

**This is the `Must` cut line.** Everything after it is capability the release can ship without, by the Product Owner's own MoSCoW assignment. All 71 `Must` stories are delivered by the end of this sprint — the viable release of SRS §1.5.

No user stories are committed. All 21 backend points are enablers, and each one closes a claim the plan has been carrying: `EN-BENCH-2` proves the outbox guarantee Sprint 08 asserted and IH-2 row 9 could only half-exercise; `EN-OBS-4` turns `NFR-AVAIL-02` from a design property into a harness that stops dependencies and watches the purchase path survive; `EN-CI-2` closes the pipeline at stage 7.

**IH-3 follows immediately.** This sprint's job is to leave it with findings rather than surprises.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `EN-FE-E2E-3` | Release 2 regression walk — every `(admin)` route driven against the real API | 8 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *10* |
| | | **Frontend total** | **8** |

## Frontend Lane

### `EN-FE-E2E-3` Release 2 regression walk (8 pts)
- [ ] **Every `(admin)` route driven against the real API** — products, categories, inventory, orders, payments, shipments, promotions, reviews, customers, roles, notifications, audit, and all five report screens
- [ ] This is the **first time several of them meet a real backend**: `/admin/audit` since Sprint 25, the report screens since Sprints 23–24
- [ ] For each route: the list renders, the detail renders, **one action is exercised**, and the designed failure screen is reached deliberately rather than assumed
- [ ] **Confirm the `(admin)` posture has not regressed**: a `CUSTOMER` reaching any of these routes sees the shell with empty sections and server-side `403`s — **never a redirect** (IH-1 row 5, [`Security.md`](../../../SA-docs/01-system/Security.md) §13 T9). Every `(admin)` route carries `noindex` and is absent from the sitemap
- [ ] `SameSite=Strict` on `(admin)` cookies, unwidened CSP per route group
- [ ] **Keep it a walk, not a second e2e suite.** `EN-FE-E2E-1`'s thin purchase path stays thin; this is breadth over the admin surface, run deliberately, with findings logged
- [ ] Record what was walked and what was not, so Sprint 32 can restate coverage honestly

---

## Integration Risk & Dependencies


**This sprint commits no user story and therefore produces nothing a gate naturally checks.** `G14`'s scope is the audit trail from Sprint 28 and whatever the regression walk surfaces — the three enablers are verified by their own demonstrations or not at all.

The real exposure is **ordering**: `G14` closes Sprint 29 and IH-3 follows it. Anything `EN-BENCH-2` or `EN-OBS-4` finds late lands in a hardening sprint whose job is to confirm the system, not to repair it. Run both harnesses early in the sprint rather than at the end.

Second: **`EN-CONTRACT-3` landed last sprint and supersedes check 7's manual walk.** `G14` should cite the suite rather than re-walk cells by hand — and if the suite is not yet in stage 4, that is a finding about Sprint 28, not a reason to fall back quietly.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
