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
