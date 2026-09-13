<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 09 — Catalog Administration

**Canonical sprint:** [Sprint 09 — Catalog Administration](../../sprint-backlogs/sprint-09-catalog-administration.md)
**Lane:** Frontend · R1 · **Gate:** **`G4` — Contract Sync** · **Backend 21 pts · Frontend 15 pts**

---

## Sprint Goal

> **An operator can manage the catalog, and the storefront notices.**

The second half of that sentence is the sprint. Catalog writes without revalidation is a feature; catalog writes *whose effect reaches the storefront through the event backbone* is the architecture [`ADR-0038`](../../../SA-docs/01-system/ADR/ADR-0038-event-driven-catalog-revalidation.md) chose — **one invalidation path, not two**. The tempting shortcut, revalidating directly from the admin write, is precisely what this sprint must not do.

This is also the last sprint before IH-1.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-ADM-05` | Manage Inventory Adjustments | 3 |
| FE | `EN-FE-API-3` | `/api/internal/revalidate` signed callback; event-driven ISR invalidation | 8 |
| FE | `EN-FE-DS-4` | Admin console shell: dense navigation, filtered-list→detail→action pattern | 4 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *3* |
| | | **Frontend total** | **15** |

## Frontend Lane

### `EN-FE-API-3` `/api/internal/revalidate` signed callback (8 pts)
- [ ] The route handler verifies a **signature**, not an IP or a shared header — an unauthenticated revalidation endpoint is a cache-poisoning surface
- [ ] Maps event → `revalidateTag`, using the tag scheme agreed in Sprint 06 with `EN-FE-PERF-1`. If the strings drifted, reconcile them here and record which side changed
- [ ] Replay-safe: the same callback twice revalidates twice and harms nothing; an unknown event type is a no-op with a log line, not a `500`
- [ ] Rejected callbacks are observable — a silently-dropped revalidation looks exactly like a working one
- [ ] Tests: valid signature revalidates, tampered body is refused, unknown tag is a no-op

### `US-ADM-05` Manage Inventory Adjustments (3 pts) — `/admin/inventory`, **R4**
- [ ] Reads `listStockAdjustments` against the mock; `inventory` does not exist until Sprint 11–12
- [ ] `E1` — an adjustment that would take available stock negative renders as the **designed `ECP-INV-4091` screen**, stating the reserved quantity and the orders holding it. Same code the storefront renders as "sold out" ([`Error Codes.md`](../../../SA-docs/04-shared/Error%20Codes.md)) — two designed screens, one code
- [ ] `E2` — reason is required by the form, and the server is still the authority
- [ ] Vitest + axe

### `EN-FE-DS-4` Admin console shell (4 pts)
- [ ] Dense navigation and the filtered-list → detail → action pattern, factored out of Sprint 08's products and categories screens rather than invented beside them
- [ ] **The `(admin)` shell renders for a `CUSTOMER`** — empty sections, `403`s behind every read. This is correct behaviour and IH-1 row 5 asserts it; a middleware redirect added here is threat `T9` of [`Security.md`](../../../SA-docs/01-system/Security.md) §13
- [ ] `noindex` on the group; absent from the sitemap
- [ ] Vitest + axe

---

## Integration Risk & Dependencies


**`EN-EVENT-2` → `EN-FE-API-3` is the only cross-lane runtime path in the plan so far**, and it has no contract test — the callback is not in `openapi.yaml`, because it is not an `ecp-api` operation. It will not be caught by checks 2 or 3 at `G4`; it has to be exercised by hand, end to end, at the gate.

Second: ten catalog write operations move from mock to real in one gate. This is the largest single increment of contract surface since Sprint 03.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
