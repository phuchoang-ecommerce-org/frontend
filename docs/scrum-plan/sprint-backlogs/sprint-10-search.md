<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Plan — Sprint 10 — Search: Keyword, Facets & Projection

**Canonical sprint:** [Sprint 10 — Search: Keyword, Facets & Projection](../../sprint-backlogs/sprint-10-search.md)
**Lane:** Frontend · R1 · **Gate:** none · **Backend 21 pts · Frontend 20 pts**

---

## Sprint Goal

> **Search answers from its own read store.**

The emphasis is on *its own*. `search` reads Elasticsearch, projected from the catalog events the Sprint 08 outbox delivers — it never queries `catalog`'s tables. That separation is what makes `NFR-AVAIL-02` achievable: a search outage degrades discovery and leaves the purchase path intact, and a catalog outage does not take search with it.

The cost of the separation is lag, and the lag is **deliberate** — recorded as `P4`. It is not a defect to be engineered away this sprint; it is a property to be bounded, stated, and re-checked at placement by `UC-ORD-05`.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-SCH-01` | Search Products by Keyword | 5 |
| FE | `US-SCH-03` | Filter and Sort Search Results | 5 |
| FE | `EN-FE-API-4` | URL search-param encoding contract (ADR-0037); R2 streamed sections | 10 |
| | | **Frontend total** | **20** |

## Frontend Lane

### `EN-FE-API-4` URL search-param encoding contract + R2 streamed sections (10 pts)
- [ ] The encoding contract of [`ADR-0037`](../../../SA-docs/01-system/ADR/ADR-0037-url-search-param-encoding-contract.md) implemented **once**, in `lib/`, and used by every filtered surface — `/search` now, `/c/[...slug]` facets and the `(admin)` lists after it
- [ ] Parse and serialise are inverses; a round-trip test over generated param sets, because a URL that does not survive a copy-paste is a shareable-state bug that only shows up in support tickets
- [ ] Unknown or malformed params degrade to the default view rather than throwing — a hand-edited URL is not an exception
- [ ] `R2` streamed-section pattern established: the shell renders immediately, results and facets stream into their boundary
- [ ] Vitest over the encoder, including the inverted-range and unknown-param cases

### `US-SCH-01` Search Products by Keyword (5 pts) — `/search`, **R2**
- [ ] `/search` as `R2` per [`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §4.1; results and facets stream inside one boundary
- [ ] `loading.tsx` skeleton in the shape of the results list
- [ ] **`E1` empty results is a designed recovery screen, not an empty state and not an error** — it offers popular keywords and category navigation, because an empty result is a conversion risk
- [ ] `E2` — search unavailable renders the designed degraded screen offering category browsing, and **the header's cart and checkout entry points stay live**. This is the visible half of `NFR-AVAIL-02`
- [ ] `E4` — the `429` screen from Sprint 04 is reused, not re-designed
- [ ] Hand-written Zod parsers for the search response and facet payloads
- [ ] Vitest + axe on results, facets, empty-recovery, and degraded screens

### `US-SCH-03` Filter and Sort Search Results (5 pts) — `/search`
- [ ] Facets and sort are **URL state**, through the `EN-FE-API-4` encoder — never component state
- [ ] Active filters are visible and individually removable; `E1` offers removal of the most restrictive
- [ ] `E2` — a rejected filter is named in the UI and the others stay applied; the page does not reset
- [ ] Changing sort or a facet resets to the first page — the cursor is not carried
- [ ] Vitest + axe

---

## Integration Risk & Dependencies


**The search index lags the catalog, and the mock does not.** Against Prism, search returns a product the instant it is created; against the real stack, it appears when the projection catches up. Every manual check in this sprint and at `G5` has to be read with that in mind, or normal lag gets logged as a bug and normal bugs get excused as lag. Agree a bound now and state it.

Second: `ECP-GEN-5030` vs `ECP-SCH-5030` is a documented discrepancy between two source documents. Both lanes must implement the **corrected** code, and if either implements the sequence diagram's version the mismatch will not surface until `G5`.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

<!-- filled at Sprint Review -->

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
