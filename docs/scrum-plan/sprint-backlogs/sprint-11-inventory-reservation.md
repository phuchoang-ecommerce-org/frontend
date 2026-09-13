<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 11 — Inventory: The Reservation Model

**Canonical sprint:** [Sprint 11 — Inventory: The Reservation Model](../../sprint-backlogs/sprint-11-inventory-reservation.md)
**Lane:** Frontend · R1 · **Gate:** **`G5` — Contract Sync** · **Backend 18 pts · Frontend 9 pts**

---

## Sprint Goal

> **The oversell guarantee is proved, not asserted.**

`NFR-REL-03` is verifiable in exactly one way: N threads race one SKU against real PostgreSQL, and the total reserved never exceeds the stock held. Not H2, not a mock, not a single-threaded test with a comment explaining why it is sufficient. The deliverable of this sprint is that race, and the three operations are what it races.

Note the lane asymmetry — 18 backend points against 9 frontend. `US-INV-01` and `US-INV-02` have **no contract surface at all**; they are internal ports that `ordering` will call in Sprint 18. The frontend's small commitment here is the plan working as intended, and the reserve is real reserve.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-INV-03` | Commit Reserved Stock on Fulfilment | 2 |
| FE | `EN-FE-DS-5` | Availability display — advisory and labelled — across catalog, cart and checkout | 7 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *9* |
| | | **Frontend total** | **9** |

## Frontend Lane

### `US-INV-03` Commit Reserved Stock on Fulfilment (2 pts) — `/admin/inventory/[stockItemId]`, **R4**
- [ ] The commit action on the stock-item detail, per [`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §7.3
- [ ] `E1` — a repeated commit reports success, and the UI does not present it as a failure just because nothing changed
- [ ] `E2` — a declined commit on a released reservation renders as the designed operator-action screen, saying what must be resolved physically
- [ ] Vitest + axe

### `EN-FE-DS-5` Availability display — advisory and labelled (7 pts)
- [ ] **One availability component**, used on `/p/[productId]`, `/c/[...slug]` cards, `/cart` lines and the checkout summary. Four implementations is four places for the labelling to drift
- [ ] It is **advisory and labelled as such** ([`Data Fetching.md`](../../../SA-docs/03-frontend/Data%20Fetching.md) §4.2) — it **never blocks add-to-cart**, because the binding check is at placement
- [ ] Three distinct states rendered distinctly: available · short (with the quantity) · unknown. "Unknown" is a designed state, not a fallback to "available"
- [ ] **`ECP-INV-4091` renders as "sold out", never as "try again".** [`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §4.3 makes this normative, and the two must be visibly different outcomes to a customer
- [ ] The Sprint 07 product page's advisory availability boundary is refactored onto this component rather than left as a second implementation
- [ ] Vitest + axe across all three states, plus a contrast assertion on the short/unknown treatments

---

## Integration Risk & Dependencies


**Two of the three backend stories have no contract surface, so `G5` cannot check them.** The oversell guarantee — the sprint's stated goal — is verified by the L5 race and nowhere else. If that test is weak, nothing downstream catches it until a flash sale in production, which is exactly `P8`.

Second: `ECP-INV-4091` now has two designed screens — "sold out" on the storefront and the adjustment-declined screen in `(admin)`. One error code, two correct renderings, one shared error map. That is the thing check 6 at `G5` is actually for.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
