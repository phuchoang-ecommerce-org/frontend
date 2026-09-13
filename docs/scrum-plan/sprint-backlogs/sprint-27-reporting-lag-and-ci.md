<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 27 — Reporting: Inventory Report, Lag & CI

**Canonical sprint:** [Sprint 27 — Reporting: Inventory Report, Lag & CI](../../sprint-backlogs/sprint-27-reporting-lag-and-ci.md)
**Lane:** Frontend · R2 · **Gate:** **`G13` — Contract Sync** · **Backend 21 pts · Frontend 13 pts**

---

## Sprint Goal

> **Every reporting screen shows its own lag.**

`NFR-PERF-06` permits five minutes. The sprint goal is not that the lag be small — it is that **an operator deciding on a five-minute-old figure must know that is what they are doing.** A figure whose age is unknown will be acted on as though it were current, which is the failure the whole reporting domain is shaped to avoid.

`EN-DATA-5` is what makes the claim checkable: the lag is **measured against the bound**, not asserted to be within it. Sprint 26 built the read models and implemented `E2`'s stale branch against a provisional bound; this sprint gives that branch a real measurement to compare against.

`EN-CI-1` brings stages 1–4 of [`Testing and Benchmark Strategy.md`](../../../SA-docs/01-system/Testing%20and%20Benchmark%20Strategy.md) §9 into a pipeline. Stage 2 is marked **never skippable**, and that word is the point.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `EN-FE-E2E-2` | Accessibility sweep: axe in component tests, token-contrast assertions, manual screen-reader pass | 13 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *5* |
| | | **Frontend total** | **13** |

## Frontend Lane

### `EN-FE-E2E-2` Accessibility sweep (13 pts)
- [ ] **axe in component tests across every component and screen delivered so far** — not only the new ones. The obligation has been per-story since Sprint 00; this is the sweep that confirms it actually held
- [ ] **Token-contrast assertions** on the design-system tokens themselves, so a future token change fails a test rather than quietly degrading every screen using it
- [ ] **A manual screen-reader pass.** [`ADR-0026`](../../../SA-docs/01-system/ADR/ADR-0026-motion-and-accessibility-baseline.md) is explicit that automated `axe` coverage is *"a floor, not all of them"* — the manual pass is the part that cannot be automated and therefore the part most likely to be skipped
- [ ] Priority order for the manual pass: the purchase path first (`/p/[productId]` → `/cart` → the checkout funnel), then `(account)`, then `(admin)`
- [ ] Reduced-motion respected everywhere the motion baseline applies
- [ ] **Findings are logged as sized backlog items with named sprints**, not fixed opportunistically until the points run out. An accessibility sweep that fixes what is easy and leaves what is hard unrecorded has made the problem invisible rather than smaller
- [ ] Record what was swept and what was not. Sprint 32 restates coverage honestly, and it can only restate what this sprint wrote down

---

## Integration Risk & Dependencies


**`G13` is the first and only gate that looks at reporting**, and four screens built across Sprints 23–24 against the mock arrive at it together. The states that matter — incomplete, stale, zero, partially unavailable — are precisely the ones Prism never generated, so all four are being verified for the first time in one session.

Concretely: if the backend's staleness field is a boolean and the frontend expected a timestamp, or if `E5`'s explicit zero and `E3`'s failure share a shape, four screens are wrong in the same way. That is check 6's job at this gate and it deserves more than a glance.

Second: `EN-CI-1` will make previously-local failures visible. A test that only ever ran on one developer's machine, or a boundary rule nobody re-ran after Sprint 24's `EN-CI-3`, surfaces here. Budget for it inside the sprint.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
