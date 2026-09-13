<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 12 — Inventory: Adjustments, Levels & Audit Entries

**Canonical sprint:** [Sprint 12 — Inventory: Adjustments, Levels & Audit Entries](../../sprint-backlogs/sprint-12-inventory-adjustments-and-audit.md)
**Lane:** Frontend · R1 · **Gate:** none · **Backend 21 pts · Frontend 13 pts**

---

## Sprint Goal

> **Stock is adjustable and every command is audited.**

`US-AUD-01` lands here and not earlier for a stated reason: `UC-AUD-01` is worth building once there are commands worth auditing, and inventory adjustment is the first one that is a **direct financial control** (`P16`, `P17`). The audit stub that Sprints 03, 04, 05 and 09 have been logging through is replaced by real `audit_entry` persistence this sprint — the table has existed since Sprint 03, ahead of its code.

The hard part is not writing entries. It is `E4`: **an adjustment whose audit entry cannot be written is not applied.** Every command path delivered so far has to adopt that refusal, which is why this is an 8-point cross-cutting story rather than a 3-point table.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-INV-04` | Adjust Inventory | 3 |
| FE | `US-INV-05` | View Inventory Levels | 5 |
| FE | `EN-FE-DS-6` | Order-status discriminated union; exhaustive transition rendering | 5 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *5* |
| | | **Frontend total** | **13** |

## Frontend Lane

### `US-INV-05` View Inventory Levels (5 pts) — `/admin/inventory`, **R4**
- [ ] Filtered list of stock items with warehouse context, on the `EN-FE-DS-4` list→detail→action shell
- [ ] `E3` — the figures are **labelled as possibly lagging**, the same honesty the `/admin` dashboard applies to reporting lag. Displayed, not hidden
- [ ] `E2` — an unknown SKU renders the group `not-found`, which never explains why
- [ ] `loading.tsx` skeleton shaped like the table; pagination through the Sprint 05 control
- [ ] Hand-written Zod parsers for stock item, warehouse, and adjustment payloads
- [ ] Vitest + axe

### `US-INV-04` Adjust Inventory (3 pts) — `/admin/inventory/[stockItemId]`, **R4**
- [ ] Adjustment form; **reason is required client-side and the server remains the authority** (`E2`)
- [ ] `E1` — `ECP-INV-4091` renders the designed adjustment-declined screen with the server-supplied reserved quantity and the orders holding it. Not an error boundary, and not the storefront's "sold out" copy
- [ ] The adjustment history renders beneath, reading `listStockAdjustments` in its own boundary
- [ ] Vitest + axe

### `EN-FE-DS-6` Order-status discriminated union (5 pts)
- [ ] Order status modelled as a **discriminated union** per [`Frontend Architecture.md`](../../../SA-docs/03-frontend/Frontend%20Architecture.md) §6.2, derived from the contract's enum rather than hand-listed
- [ ] Permitted next transitions are exhaustive at compile time — **an unhandled state is a build failure, not a blank action bar**
- [ ] A deliberately-added state that is not handled fails `npm run typecheck`. That demonstration is the deliverable, in the shape `EN-GATE-1` set in Sprint 01
- [ ] Built now, used from Sprint 17 — `ordering` does not exist yet, and this is the frontend running ahead as designed
- [ ] Vitest over the transition table

---

## Integration Risk & Dependencies


**`US-AUD-01` changes the behaviour of code that already passed a gate.** Every command path from Sprints 03, 05 and 09 acquires a new refusal branch this sprint. Nothing in the `G6` checklist will look at Sprint 09's catalog writes again, so the regression has to be caught here — re-run the catalog write paths with audit persistence failing, and confirm the change is refused rather than silently applied.

Second: `adjustStock`'s `ECP-INV-4091` and the storefront's are now genuinely different screens for one code. Confirm the error map routes by **context**, not by code alone.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
