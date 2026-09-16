<!-- Derived from the canonical PM-docs plan. Sprint review notes below record
     the frontend implementation state until the canonical generator is run. -->

# Frontend Plan — Sprint 08 — Event Backbone: Outbox & Kafka

**Canonical sprint:** [Sprint 08 — Event Backbone: Outbox & Kafka](../../sprint-backlogs/sprint-08-event-backbone.md)
**Lane:** Frontend · R1 · **Gate:** none · **Backend 21 pts · Frontend 13 pts**

---

## Sprint Goal

> **No accepted business event can be silently lost.**

`EN-EVENT-1` is the single largest enabler in the plan and the one everything downstream assumes: search projection (S10), catalog revalidation (S09), order lifecycle (S18), notification (S23), and the reporting read models (S26–S27) all take it as given. It is committed as one 21-point item rather than split, because an outbox that is half-built is an outbox that loses events — and the point of the sprint is the guarantee, not the table.

The frontend lane spends the sprint **a full sprint ahead of the backend**, building the admin catalog console against the Prism mock. That is the contract-first dividend working as designed, not slack.

## Committed Frontend Work

| Lane | ID | Item | Pts |
|---|---|---:|---:|
| FE | `US-ADM-01` | Manage Products | 8 |
| FE | `US-ADM-02` | Manage Categories | 5 |
| FE | — | *Lane reserve — see [`../release-plan.md`](../release-plan.md) §6* | *5* |
| | | **Frontend total** | **13** |

## Frontend Lane

> Built entirely against the Prism mock. `createProduct` and friends do not exist in `ecp-api` until Sprint 09; they exist in `openapi.yaml` today, which is the point.

### `US-ADM-01` Manage Products (8 pts) — `/admin/products`, `/admin/products/new`, `/admin/products/[productId]`, **R4**
- [x] The `(admin)` list → detail → action shape per [`Routing.md`](../../../SA-docs/03-frontend/Routing.md) §7.2, on the group's `SameSite=Strict` posture
- [x] Reads `listProducts`, `getProduct`, `listProductVariants`; writes `createProduct`, `updateProduct`, `deleteProduct`, `setProductPublication`, `addProductVariant`, `removeProductVariant`, `changeVariantPrice`, `addProductImage`, `removeProductImage`, `amendProductsInBulk`
- [x] `E1` duplicate SKU and `E3` removal of a product with stock or open orders render as **named, designed outcomes** — `E3` offers unpublishing, which is the actual commercial intent
- [x] `E4` — a failed validation applies nothing; the form is whole-or-nothing, and the UI must not leave half a submission applied
- [x] **The save confirmation says the storefront updates within seconds, not on save** ([`ADR-0038`](../../../SA-docs/01-system/ADR/ADR-0038-event-driven-catalog-revalidation.md)). Wording it as immediate is the mistake this sprint can still cheaply avoid
- [ ] Hand-written Zod parsers for every admin catalog payload; `loading.tsx` per segment; `<Suspense>` per independently-fetched section
- [x] Vitest + axe, including the dense-table keyboard path

### `US-ADM-02` Manage Categories (5 pts) — `/admin/categories`, `/admin/categories/[categoryId]`, **R4**
- [x] Reads `listCategories`, `getCategory`, `listCategoryProducts`; writes `createCategory`, `updateCategory`, `deleteCategory`
- [x] `E1` cycle and `E2` removal-while-occupied render with **the counts the server returns** — the client never computes them and never pre-empts the check
- [x] Parent reassignment UI makes the cycle constraint visible before submission, while still letting the server be the authority
- [ ] Vitest + axe

---

## Integration Risk & Dependencies


**Nothing this sprint meets at a gate — and that is the risk.** The backend ships an enabler with no contract surface, and the frontend ships two stories whose endpoints do not exist. The first time either is tested against the other is `G4`, two sprints of divergence later.

The concrete exposure: the admin console is being built against Prism's generated examples for ten write operations. Whatever assumptions those examples encode — field optionality, error shapes on `E1`/`E3` — go unchallenged until Sprint 09. Worth one deliberate read of the `admin` sections of `openapi.yaml` by both developers this sprint, rather than discovering it at the gate.

## Definition of Done

Every item satisfies the [frontend Definition of Done](../definition-of-done.md) and the [shared story-level integration criteria](../../definition-of-done.md#5-definition-of-done--the-story).

## Review Notes

- Frontend implementation delivered: R4 product and category administration routes, Server Actions, no-store reads, shaped loading states, and named conflict recovery.
- Contract amended for category deletion: the `409` payload now returns authoritative `productCount` and `childCategoryCount`. The local and canonical `../docs-extract` OpenAPI copies were synchronized and regenerated types are current.
- Focused Vitest suite passes, including the typed blocker and dense-table keyboard/axe path. The production build reaches application compilation; this environment then fails to download Inter from Google Fonts.
- Prism runtime validation and category-specific axe coverage remain before Sprint Review. Real `ecp-api` validation remains the Sprint 09/G4 dependency.
- GitHub issue and Project updates were skipped because GitHub CLI authentication was invalid.

## Retrospective

**Went well:**
**Change one thing:**
**Action (owned, carried to next sprint's board):**
