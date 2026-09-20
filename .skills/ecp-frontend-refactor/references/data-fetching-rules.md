# references/data-fetching-rules.md

## Purpose

Protect API, consistency, caching and mutation semantics during refactoring.

---

## Single API Caller

`ecp-api` is called from the frontend server.

Do not introduce browser-to-backend calls.

Do not create a second fetch client.

Do not bypass the configured API boundary from feature components.

---

## Read Policy

Every read must make its cache semantics explicit.

Preserve whether data is:

* statically cached;
* time-revalidated;
* explicitly uncached.

Do not replace explicit policy with framework defaults.

---

## Authoritative Data

Per-user and authoritative data must not become stale client-cached state because of a
refactor.

Examples include:

* cart load;
* checkout state;
* order state;
* payment state;
* account state;
* authoritative stock;
* admin authoritative operations.

---

## Advisory Data

Projected or advisory data may tolerate bounded staleness when architecture permits it.

Do not make advisory data appear authoritative during component cleanup.

---

## Runtime Parsing

Responses are parsed at the boundary using feature-owned schemas.

Do not trust generated TypeScript declarations as runtime validation.

Do not move parsing into leaf UI components.

---

## Client Cache Closed Set

React Query or equivalent client remote-state caching is allowed only for approved
browser-owned interactions.

Treat expansion of this list as an architecture change.

Do not introduce client caching merely because a refactor extracts a hook.

---

## Writes

Writes travel through the approved server mutation path.

Do not turn a Server Action into a browser-side direct backend call.

Preserve:

* CSRF checks;
* session resolution;
* idempotency behavior;
* typed error mapping;
* owned revalidation.

---

## Automatic Retry

Do not introduce automatic retry for writes that previously had none.

Order placement and money-critical operations require especially strict preservation
of unknown-outcome semantics.

---

## Optimistic UI

Do not introduce optimistic behavior merely to simplify interaction code.

Only operations explicitly safe for optimistic UI may use it.

A business-rejectable operation must not be optimistically presented as successful.

---

## Pagination

Preserve cursor semantics.

The cursor is opaque.

Do not parse, derive or reconstruct it.

Do not introduce offset pagination or page-number UI while refactoring lists.

---
