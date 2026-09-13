<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 26 — Reporting: Read Models & Core Reports

**Canonical sprint:** [Sprint 26 — Reporting: Read Models & Core Reports](../../sprint-backlogs/sprint-26-reporting-read-models.md)
**Lane:** Frontend · R2 · **Gate:** none · **Backend 18 pts · Frontend 0 pts**

---

## Sprint Goal

> **Reporting answers from MongoDB, never from the write model.**

`CON-06` holds at the **process level**: reporting queries must not compete with transactions. That is not a performance preference — it is what `P13` is about, and `UC-RPT-01` `E6` states the priority plainly: under contention **the report waits, not the checkout**. A revenue query that touches PostgreSQL is a correct-looking implementation that fails the constraint.

The second theme is that **an honest figure beats a complete-looking one**. `E1` marks a period including today as incomplete; `E2` states the as-at time and labels a figure stale beyond the permitted lag; `E5` presents zero explicitly and distinguishably from a computation failure — *"no revenue" and "we could not compute revenue" are different facts and must never look alike.*

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *18* |
| | | **Frontend total** | **0** |

## Frontend Lane

No lane-specific task section is present in the canonical sprint backlog.

## Integration Risk & Dependencies


**Nothing this sprint meets a gate on either side** — the backend ships three read operations the frontend already built screens for three sprints ago, and they meet at `G13` next sprint.

The concrete exposure is that **the honest-figure states are the ones Prism cannot generate.** The frontend built incomplete, stale, zero, and partially-unavailable renderings against mock data that is none of those things. Whether the backend's `asAt`, `incomplete` and `unavailable` field shapes match what those screens parse is unverified until `G13`. One deliberate read of the reporting schemas in `openapi.yaml` by both developers this sprint costs an hour and removes the whole class.

Second: **`EN-DATA-5` is next sprint, not this one.** The MongoDB read models are built here and their *lag measurement* against `NFR-PERF-06` is Sprint 27. Until then `E2`'s "beyond the permitted lag" branch has no measured lag to compare against — implement the branch, and record that the bound it tests against is provisional.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
