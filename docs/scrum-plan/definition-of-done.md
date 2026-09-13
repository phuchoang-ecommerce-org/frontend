<!-- Generated from the canonical PM-docs plan. Do not edit directly; run `node PM-docs/scripts/generate-lane-plans.mjs`. -->

# Frontend Definition of Ready and Done — ECP

**Document type:** Derived lane quality gate · **Canonical source:** [Definition of Done](../definition-of-done.md)

---

This view makes the frontend slice’s acceptance gates directly usable. The canonical document controls where wording differs.

## 2. Definition of Ready

An item may not enter a sprint until all six hold. An item that fails goes back to Refinement — never into the sprint "to be clarified during."

| # | Criterion |
|---|---|
| 1 | Acceptance criteria exist as Given/When/Then in [`../BA-docs/user-stories/`](../../BA-docs/user-stories/README.md), **including one per exception flow** of the source use case |
| 2 | Its OpenAPI `operationId`s are named, and each one exists in `openapi.yaml` |
| 3 | Its `ecp-web` route is named, or the story is explicitly marked as having no route ([`Routing.md`](../../SA-docs/03-frontend/Routing.md) §10.2) |
| 4 | Both lane slices are estimated, `0` included |
| 5 | Its permission-matrix cell is identified for every operation it touches |
| 6 | No unresolved contract question remains. If one exists, it is amended per [`integration-plan.md`](../integration-plan.md) §5 **before** the sprint, not during it |

---

## 4. Definition of Done — Frontend Slice

| # | Criterion | Source |
|---|---|---|
| 1 | `tsc --noEmit` passes under `strict`, with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` and `verbatimModuleSyntax` | [`ADR-0020`](../../SA-docs/01-system/ADR/ADR-0020-typescript-strict-mode.md); Frontend Architecture §6.1 |
| 2 | No `any`. `unknown` plus narrowing is the sanctioned alternative | `ADR-0020` §4 — *"`any` is a defect"* |
| 3 | ESLint passes, **including** `eslint-plugin-boundaries` (import rules `I-1`–`I-8`) and `dependency-cruiser`'s cycle check | [`Feature Structure.md`](../../SA-docs/03-frontend/Feature%20Structure.md) §4.1 |
| 4 | Generated types regenerated; **the diff is empty** | Frontend Architecture §6.3 |
| 5 | A hand-written, reviewed Zod parser exists for every response the UI depends on structurally | Frontend Architecture §6.3 |
| 6 | Vitest + Testing Library cover keyboard interaction, focus visibility, and the ≥ 44 px hit area; `axe` passes | [`ADR-0026`](../../SA-docs/01-system/ADR/ADR-0026-motion-and-accessibility-baseline.md) §4 |
| 7 | `loading.tsx` is a skeleton **in the shape of the content** — never a full-page spinner, never sized from a count that may be absent | [`Routing.md`](../../SA-docs/03-frontend/Routing.md) §8 |
| 8 | Every independently-fetched section has its own `<Suspense>` boundary. A failing section degrades to its own empty state and does **not** reach the page's `error.tsx` | `NFR-AVAIL-02`; Routing §8 |
| 9 | `error.tsx` shows the correlation id and **no stack and no response body** | [`Security.md`](../../SA-docs/01-system/Security.md) §8.4 |
| 10 | **No arithmetic on `Money` anywhere.** The frontend formats money; it never computes it | Frontend Architecture §6.2 |
| 11 | No Tailwind arbitrary values and no raw hex in component source | [`ADR-0022`](../../SA-docs/01-system/ADR/ADR-0022-ma-design-tokens.md) §4 |
| 12 | The route's rendering class (`R1`–`R4`) and cache posture match [`Routing.md`](../../SA-docs/03-frontend/Routing.md) §3. Nothing in `(auth)`, `(account)`, `(admin)`, cart or checkout is cached or indexed |
| 13 | The screen renders correctly against **both** the Prism mock **and** the real `ecp-api` | [`integration-plan.md`](../integration-plan.md) §2.3 |

---

## 5. Definition of Done — the Story

A story is Done when **both** slices satisfy their lane's list **and**:

| # | Criterion |
|---|---|
| 1 | The Contract Sync checklist ([`integration-plan.md`](../integration-plan.md) §3) has passed for this story's domain |
| 2 | The story was **demonstrated against the running system** at a Sprint Review — not a screenshot, not a passing test |
| 3 | Every acceptance criterion in its user-story file is satisfied, exception-flow criteria included |
| 4 | Any contract drift it surfaced was amended in `openapi.yaml`, not worked around |
| 5 | Nothing was left as a `TODO` that the acceptance criteria required |

**The `Integrated` column is where this is enforced.** A merged, green slice sits there until the gate. Two lanes each reporting complete against a system nobody has run is the specific failure this column exists to prevent.

---

## 6. Definition of Done — a Release

The `AC-01`–`AC-06` table of [`Testing and Benchmark Strategy.md`](../../SA-docs/01-system/Testing%20and%20Benchmark%20Strategy.md) §11, completed honestly. Its current expected state at the end of Release 2:

| Criterion | Verified by | Expected status |
|---|---|---|
| `AC-01` Core workflows function correctly | L1 + L4 + the thin Playwright suite over `Must` use cases | **Met** |
| `AC-02` Rules enforced regardless of entry point | Each rule exercised through REST, scheduler, and Kafka paths | **Met** |
| `AC-03` New modules added with minimal modification | Worked example, reviewed | **Reviewed, not tested** — it is a design review, not a suite |
| `AC-04` Maintainable as complexity grows | L2 | **Met** once `EN-GATE-1` lands in S01 |
| `AC-05` Reporting does not impact transactions | `NFR-PERF-05` concurrent load | **Unverified — deferred** |
| `AC-06` Production-quality architecture | L5 + L6 + Security §12, **and** peak-load evidence | **Partially met** — the fault-injection half passes; the peak-load half is deferred |

**`AC-05` and `AC-06` are recorded as not-yet-met, not as in progress.** The load rig they depend on is deliberately deferred, with five dated triggers that end the deferral (Testing Strategy §7.9). Restating that here is the point: the plan must not quietly claim what the strategy explicitly says is unverified.

A release is Done when this table is **filled in truthfully**, not when every row says met.

---
