# F1 contract and IH-1 verification record

**Checked:** 2026-10-28  
**Contract:** `../../docs/SolutionArchitecture/04-shared/OpenAPI/openapi.yaml`

This record separates implemented frontend work from integration evidence. A
mock or static check is not treated as proof that the real API path passes.

## Contract audit

| Domain | Frontend operations in the current purchase path | Result |
| --- | --- | --- |
| Identity | `registerAccount`, `verifyEmailAddress`, `resendEmailVerification`, `logIn`, `renewSession`, `logOut` | All requests now use the single server-only API client and session responses are parsed at runtime. Real API drift remains on login/cart merge (below). |
| Catalog | `listCategories`, `getCategory`, `listProducts`, `listCategoryProducts`, `getProduct` | Aligned. `/products` now requests one cursor page and stores the opaque next cursor in the URL instead of walking every root category and every page. |
| Cart | `getCurrentCart`, `addCartLine`, `updateCartLineQuantity`, `removeCartLine` | Requests align. Cart reads now use a reviewed runtime parser based on the generated contract and no longer depend on the real API's extra `expired` or `availableQuantity` fields. |

Generated types are checked in at `src/lib/api/types.ts`. `npm run
contract:check` regenerates to a temporary file and fails on drift. Prism is
available through `npm run mock:api`. TypeScript strictness, ESLint layer
boundaries, and dependency-cycle checks are part of `npm run check`.

## Confirmed contract drift

| ID | Evidence | Owner and target |
| --- | --- | --- |
| F1-CONTRACT-01 | **Code alignment completed 2026-10-28.** `CredentialsRequest.guestCartId` is now the only guest-cart merge transport; the backend returns the normative structured `Session.cartMerge` outcome instead of `cartMergeNotices`. The frontend removed its temporary cookie-header and notice compatibility paths. Focused backend MVC and frontend unit tests pass. | Frontend + backend, F1 live smoke / Contract Sync: verify the deployed API and browser flow with a real guest cart. |
| F1-CONTRACT-02 | **Code alignment completed 2026-10-28.** Public Cart DTOs no longer serialize `expired` or `availableQuantity`; those values remain internal only. The frontend continues to derive expiry from `status` and renders a non-numeric stock-short message. Focused backend MVC and mapper tests pass. | Frontend + backend, F1 live smoke / Contract Sync: verify the deployed API Cart response against the normative contract. |
| F1-CONTRACT-03 | **Resolved 2026-10-27.** The backend now exposes guest-readable `GET /products`, backed by the catalog's cursor-paginated query path. Live pages of two then one seeded product returned `200`, with a stable total of three. | Backend owner, F1. Regression coverage protects the exact public route, global listing query, cursor scope, SQL, and cache invalidation. |
| F1-CONTRACT-04 | **Resolved 2026-10-27.** Cart's public `Money.amount` now uses the established decimal-string wire serializer while retaining `BigDecimal` for internal arithmetic. A live guest cart returned `"amount":"0"`, which the frontend parser accepted. | Backend owner, F1. MVC coverage asserts the JSON string representation. |

Prism 5.16 terminates the recursive `CategoryNode.children` sample with a
`null` sentinel even though the array item schema is non-null. The reviewed
runtime parser discards only that recursion sentinel so the normative mock can
render; real category objects are still parsed recursively. This is mock-tool
friction, not evidence of an API amendment.

## IH-1 disposition

| IH-1 item | Current verdict | Owner / next evidence |
| --- | --- | --- |
| IH1-01 token custody | UNVERIFIED | Frontend + QA in IH-2: browser/network/storage inspection against real web + API. Static source still keeps tokens in the server session module. |
| IH1-02 CSRF | UNVERIFIED | Frontend + QA in F2: real missing/forged-origin write checks for every delivered action. |
| IH1-03 refresh mutex | UNVERIFIED | Frontend + QA in F2: concurrent expired-session browser/API run proving one renewal. |
| IH1-04 cookie posture | UNVERIFIED | Frontend + QA in F2: customer and operator login with actual `Set-Cookie` inspection. |
| IH1-05 role refusal | UNVERIFIED | Backend + QA in F3: matrix-driven real-API checks; guest catalog reads must remain allowed. |
| IH1-06 signed revalidation | UNVERIFIED | Backend in F3: runtime and host Kafka now start; run write → outbox → Kafka → signed callback with the shared test secret. |
| IH1-07 cache/noindex | UNVERIFIED | Frontend + QA in IH-2: inspect production route manifests and served headers. |
| IH1-08 correlation trace | UNVERIFIED | Backend in F3: runtime and Kafka connect; capture one real end-to-end correlated catalog trace. |
| IH1-09 full permission matrix | UNVERIFIED | Backend + QA in IH-2: real-API matrix suite for delivered identity/catalog cells. |

## Runtime evidence from this pass

- Prism 5.16 served the checked-in contract on `127.0.0.1:4010`. Next.js
  rendered `/products`, a cursor URL, a category page, and a guest cart through
  the same API client.
- The current Compose Kafka configuration exposes separate container and host
  listeners. PostgreSQL, Kafka, `redis-cache`, and `redis-state` became healthy,
  and a host-run API connected to Kafka and started on `:8080`.
- The Compose `app` profile itself exited before Gradle because the shared
  Gradle-volume lock was not writable by its configured UID. Host `bootRun`
  with the installed Java 21 runtime was the non-code workaround for this pass.
- Against the real API, `/categories` and category products returned `200`, and
  the category route rendered the three seeded products. A temporary guest cart
  was created, one seeded variant was added (`200`), and that test line was
  removed (`204`).
- After the backend repair, the top-level product route returned `200`, its
  cursor advanced across both pages, and the web `/products` route rendered all
  three seeded products. A cookie-backed guest cart rendered without a contract
  parser error. F1-CONTRACT-03 and F1-CONTRACT-04 are resolved.
- Backend `test` passed across all modules. The later Testcontainers `check`
  run was stopped at the user's request; before it was stopped, an unrelated
  inventory concurrency test had reported a lock-acquisition failure. No IH-1
  row was promoted to pass from this narrower run.

Prism remains development evidence only. The full signed revalidation and
correlated-trace paths were not executed in this pass.
