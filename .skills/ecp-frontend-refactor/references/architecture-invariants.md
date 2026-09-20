# references/architecture-invariants.md

## Purpose

This file defines the architecture properties a frontend refactor must preserve or
restore.

Use these rules to distinguish architecture violations from local code-quality
preferences.

---

## Layer Ownership

The frontend has four primary structural areas:

```text
app/
features/
lib/
components/
```

### `app/`

Owns application composition.

Valid responsibilities include:

* pages;
* layouts;
* loading boundaries;
* error boundaries;
* not-found boundaries;
* route handlers;
* composition of multiple features.

Invalid responsibilities include:

* reusable domain transformations;
* reusable API query logic;
* feature-specific state machines;
* API response parsing;
* reusable business validation.

---

### `features/<domain>/`

Owns API-domain-specific behavior.

A feature may contain, where needed:

```text
components/
server/
schema/
url/
types.ts
```

Feature folders are created because a real feature responsibility exists, not to
pre-populate an architecture diagram.

A feature's public API should remain intentionally small.

Feature internals should not become globally importable merely for convenience.

---

### `lib/`

Owns cross-cutting infrastructure rather than business features.

Examples:

```text
lib/api
lib/session
lib/observability
lib/utils
```

`lib` is not a location for arbitrary domain helpers.

A module containing product, order, payment, promotion, cart, or other domain-specific
behavior generally belongs to the owning feature.

---

### `components/`

Owns reusable domain-neutral UI and layout elements.

`components/ui` contains design-system primitives.

It must not know how to:

* fetch products;
* load carts;
* inspect sessions;
* interpret order state;
* calculate promotion eligibility;
* understand backend error codes;
* call domain actions.

---

## Import Invariants

### I-1

A feature must not import another feature.

```text
features/catalog -> features/review
```

is forbidden.

Cross-feature composition must be made visible in `app/`.

### I-2

`app/` is the frontend composition root.

It may compose features, shared UI, infrastructure and permitted stores.

### I-3

Features must not import `app/`.

Dependency direction does not point back to route composition.

### I-4

Only the designated API infrastructure may own direct communication with `ecp-api`.

Only the designated session infrastructure may own session-cookie custody.

### I-5

Shared UI and layout components must not import feature code or the API client.

### I-6

Server infrastructure and feature server modules must remain server-only.

### I-7

Server code must not import browser client stores.

### I-8

React Query usage is restricted to the explicitly allowed client-owned interaction
cases.

---

## Dependency Cycles

No architectural refactor may introduce a cycle.

Pay particular attention to cycles formed indirectly through:

```text
feature
  ↓
lib/utils
  ↓
component
  ↓
feature
```

A cycle hidden behind a generic utility module is still a cycle.

---

## Public Contract Invariants

A structural refactor must not silently change:

* route URLs;
* search parameter encoding;
* OpenAPI operations;
* HTTP semantics;
* cursor pagination;
* problem-code interpretation;
* cache policy;
* revalidation tags;
* idempotency behavior;
* session behavior;
* CSRF behavior;
* permission non-disclosure;
* accessibility semantics.

Changes to these are contract changes, not ordinary refactors.

---
