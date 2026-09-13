<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 32 — Release 3: Reviews, Reporting & Launch Readiness

**Canonical sprint:** [Sprint 32 — Release 3: Reviews, Reporting & Launch Readiness](../../sprint-backlogs/sprint-32-launch-readiness.md)
**Lane:** Frontend · R3 · **Gate:** **`RR` — Release Readiness Review** · **Backend 23 pts · Frontend 19 pts**

---

## Sprint Goal

> **The release is ready and its unverified claims are stated as unverified.**

The last sprint of thirty-six. Six stories close the backlog — all 87 user stories delivered — and then the sprint does the thing the whole document set has been building toward: it **completes the `AC-01`–`AC-06` table honestly**.

`AC-05` and `AC-06` are recorded as **unverified**, pending the load rig ([`Testing and Benchmark Strategy.md`](../../../SA-docs/01-system/Testing%20and%20Benchmark%20Strategy.md) §11, §7.9). IH-3 row 9 already established that; this sprint restates it in the release's own words rather than softening it on the way out. **A release is Done when the table is filled in truthfully, not when every row says met** ([`../definition-of-done.md`](../definition-of-done.md) §6) — and a delivery plan that quietly claims what the test strategy says is unverified is the failure mode `P15` describes, arriving through the last available door.

Two stories carry a rule worth naming. `US-REV-05` `E5`: **a moderation whose audit entry cannot be written is not applied** — nothing external has happened, so refusing is safe, and an unattributable suppression of a customer's words is precisely what `P17` forbids. And `US-NTF-04` `E1`: **transactional notifications cannot be disabled** (`BR-NTF-02`) — a customer who does not know their order shipped will contact Support, and one who does not know they were refunded may dispute the charge.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-REV-02` | Edit Own Review | 3 |
| FE | `US-REV-03` | Delete Own Review | 2 |
| FE | `US-REV-05` | Moderate Review | 3 |
| FE | `US-NTF-04` | Manage Notification Preferences | 3 |
| FE | `US-RPT-03` | View Customer Report | 3 |
| FE | `US-RPT-06` | Export Report | 5 |
| | | **Frontend total** | **19** |

## Frontend Lane

### `US-RPT-06` Export Report (5 pts) — `/admin/reports/exports`, **R4**
- [ ] Request → poll → download, matching the asynchronous backend shape
- [ ] **`E2` — an over-large export renders the designed narrow-your-filters screen**, not a generic error
- [ ] **Where an export contains personal data, the screen says so before the request is made.** `E3` audits it; the UI should not let it happen unknowingly
- [ ] The export list shows each request's state and age; a completed export states when its link expires
- [ ] `loading.tsx`; hand-written Zod parsers; Vitest + axe

### `US-REV-05` Moderate Review (3 pts) — `/admin/reviews`, `/admin/reviews/[reviewId]`, **R4**
- [ ] Reads `listReviews`, `getReview` and the reports `reportReview` produced; writes `moderateReview`, `removeReviewImage`
- [ ] **Reason is required by the form**, and the server remains the authority (`E3`)
- [ ] `E2` — an already-moderated review **shows the existing decision** and does not offer a second
- [ ] `E5` — a failed audit write renders the moderation as **not applied**, never as applied-with-a-warning
- [ ] Vitest + axe

### `US-NTF-04` Manage Notification Preferences (3 pts) — `/account/preferences`, `/unsubscribe`, **R3**
- [ ] **Transactional notification toggles are not drawn as disabled controls — they are not drawn.** The screen explains why (`BR-NTF-02`), because a greyed-out switch invites a support ticket
- [ ] `/unsubscribe` works from an email link **without a session**; `E2` — an expired token offers signing in rather than a dead end
- [ ] **`E3` — a failed store shows the previous state and says the change did not apply.** Never an optimistic success
- [ ] `E4` — the screen states that preferences apply to notifications raised from now on
- [ ] Vitest + axe

### `US-REV-02` Edit Own Review (3 pts) · `US-REV-03` Delete Own Review (2 pts) — `/account/reviews`, **R3**
- [ ] The customer's own reviews with edit and delete; `E1` states when the edit window closed rather than hiding the control silently
- [ ] `E4` on edit — a failed validation **leaves the original intact and visible**; the form never clears
- [ ] Delete is optimistic and reverts visibly on failure, the Sprint 13 pattern
- [ ] Vitest + axe

### `US-RPT-03` View Customer Report (3 pts) — `/admin/reports/customers`, **R4**
- [ ] The as-at, staleness, incomplete and explicit-zero treatments established in Sprint 23 — one implementation, reused
- [ ] Export from this screen routes through `US-RPT-06`'s authority and audit path, never a client-side download
- [ ] Vitest + axe

---

## Integration Risk & Dependencies


**There is no Contract Sync gate after this sprint.** `G15` was the last, and the Release Readiness Review states status rather than finding defects. Six stories on both lanes integrate with nothing scheduled behind them — so the integration has to happen *inside* the sprint, deliberately, not at a gate that does not exist.

Second, and the one this sprint most needs to resist: **the readiness review will be under pressure to look finished.** `AC-05` and `AC-06` will be sitting at unverified in the last sprint of a seventeen-month plan, and the cheapest available edit is to call them "in progress". IH-3 row 9 anticipated this; so does [`../definition-of-done.md`](../definition-of-done.md) §6. The correct outcome is a table with two honest failures in it.

Third: neither lane has reserve. If a story slips, the readiness review is what gets compressed — which is exactly backwards. **Timebox the review and protect it at Planning.**

---

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
