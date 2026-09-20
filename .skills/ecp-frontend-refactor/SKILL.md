---
name: ecp-frontend-refactorer

---
# ECP Frontend Refactor

## Purpose

Use this skill when refactoring existing frontend code in the Enterprise Commerce
Platform.

The purpose of the skill is not general cleanup. Its purpose is to transform an
existing implementation toward the project's documented frontend architecture while
preserving observable behavior, API contracts, security boundaries, runtime semantics,
and user-facing behavior unless an explicit change request states otherwise.

A refactor performed with this skill is an architecture-preserving migration.

The expected transformation is:

```text
existing implementation
        +
frontend architecture
        +
shared contracts
        ↓
architectural diagnosis
        ↓
bounded migration plan
        ↓
behavior-preserving refactor
        ↓
mechanical verification
```

Do not use this skill to design a new feature from scratch. Use the frontend feature
implementation skill for new feature development.

Do not use refactoring as an opportunity to redesign architecture, alter requirements,
or introduce new infrastructure decisions.

---

## Authoritative Sources

Treat the following project documentation as normative when evaluating or changing
frontend code:

* Frontend Architecture
* Feature Structure
* Data Fetching
* State Management
* Routing
* Performance
* UI Design System
* Security
* Integration Contract
* Error Codes
* Permission Matrix
* OpenAPI contract
* accepted or applicable frontend ADRs

Existing source code is evidence of the current implementation, not evidence of the
intended architecture.

When implementation and normative architecture disagree, identify the disagreement
explicitly and plan a migration toward the documented architecture.

Do not silently reinterpret or replace an architecture decision.

If a required change cannot be resolved from the existing architecture, mark it:

```text
ARCHITECTURAL DECISION REQUIRED
```

Do not invent the missing decision during a refactor.

---

## Primary Objective

For every refactoring task, optimize for the following properties in this order:

1. Preserve externally observable behavior.
2. Restore or strengthen architecture boundaries.
3. Reduce accidental coupling.
4. Improve responsibility placement.
5. Reduce unnecessary client-side execution.
6. Improve local maintainability.
7. Reduce duplication only when doing so does not weaken boundaries.
8. Improve naming and local readability after structural correctness is established.

A smaller architecture-correct duplication is preferable to a reusable abstraction
that creates an illegal dependency.

A structurally correct implementation is more important than a cosmetically elegant
one.

---

## Non-Goals

The following are not valid reasons by themselves to perform a refactor:

* making files shorter;
* reducing line count;
* introducing a preferred abstraction style;
* replacing working code with a newer library;
* eliminating every duplicated component;
* moving logic merely because another location looks cleaner;
* converting Server Components to Client Components for convenience;
* introducing React Query for uniformity;
* creating generic shared abstractions that contain domain knowledge;
* rewriting an entire feature when a bounded migration is sufficient.

Avoid speculative abstractions.

Do not refactor code outside the requested or approved migration scope merely because
it is nearby.

---

## Required Refactoring State Machine

Every task follows this state machine:

```text
AUDIT
  ↓
PLAN
  ↓
IMPLEMENT ONE MIGRATION SLICE
  ↓
VERIFY
  ↓
REPORT
  ↓
NEXT SLICE
```

Do not move directly from AUDIT to broad implementation.

Do not implement multiple unrelated migration slices simultaneously.

Each migration slice must leave the repository in a valid state.

---

# Phase 1 — AUDIT

Before editing code, reconstruct the current implementation.

For the requested scope identify:

* route entry points;
* layouts and route boundaries;
* Server Components;
* Client Components;
* feature ownership;
* cross-feature dependencies;
* server queries;
* server actions;
* API access;
* schemas and parsing;
* URL state;
* client state;
* persistent or server state;
* cache semantics;
* error handling;
* Suspense boundaries;
* error boundaries;
* session access;
* security-sensitive code;
* shared UI dependencies;
* tests covering the current behavior.

Build a dependency picture before proposing file movements.

The minimum useful runtime picture is:

```text
route
  ↓
page/layout
  ↓
feature composition
  ↓
feature component
  ↓
query/action
  ↓
API boundary
  ↓
ecp-api
```

For interactive paths also derive:

```text
server-rendered region
        ↓
small client boundary
        ↓
interaction state
        ↓
server action or permitted client cache path
```

---

## Finding Classification

Classify every finding into one of four categories.

### A. Architecture Violation

A rule established by project architecture is currently violated.

Examples:

* `features/A` imports `features/B`;
* `app/` contains reusable domain logic;
* browser code calls `ecp-api`;
* fetch client is imported outside its allowed boundary;
* session cookies are read outside session infrastructure;
* server code imports a client store;
* React Query is used outside an allowed interaction;
* a page-level `"use client"` boundary exists without necessity;
* domain knowledge lives inside `components/ui`;
* authoritative data is client cached;
* money is converted to a JavaScript number for computation.

Architecture violations have the highest refactoring priority.

### B. Structural Debt

The code is architecture-compatible but responsibilities are poorly separated.

Examples:

* one component performs orchestration, transformation, rendering, and interaction;
* query construction and presentation logic are mixed;
* response parsing occurs far from the network boundary;
* large condition trees hide domain states;
* URL encoding logic is repeated;
* feature-local server logic is spread across components.

Structural debt should be resolved when it improves responsibility ownership without
creating unnecessary abstractions.

### C. Local Maintainability Debt

The structure is valid but difficult to understand or change.

Examples:

* misleading naming;
* duplicate pure transformations;
* deeply nested rendering branches;
* overly broad prop objects;
* obsolete indirection;
* unnecessary wrapper components.

Resolve these after architecture and structural issues.

### D. Cosmetic Preference

A change with no meaningful architecture, behavior, or maintainability benefit.

Do not include cosmetic preference in the migration plan unless specifically requested.

---

# Phase 2 — PLAN

Derive target placement from architecture before editing.

For each finding determine:

```text
current responsibility
        ↓
correct owner
        ↓
migration boundary
        ↓
behavior to preserve
        ↓
validation required
```

Do not design target placement based only on file size or naming.

Use project placement rules.

---

## Migration Slice Rule

A migration slice is the smallest meaningful architecture transformation that can be:

* implemented independently;
* validated independently;
* reviewed independently;
* reverted independently.

Typical migration slices include:

* moving a query from `page.tsx` to `features/<domain>/server/queries.ts`;
* extracting a client leaf from an oversized client subtree;
* removing a cross-feature dependency by lifting composition to `app/`;
* moving domain UI out of `components/ui`;
* centralizing URL parsing into the owning feature;
* replacing unauthorized React Query usage with server fetching;
* introducing runtime parsing at an API boundary;
* splitting an oversized feature component by responsibility.

Avoid migration slices defined only by file type such as:

```text
refactor all hooks
refactor all components
refactor all schemas
```

Prefer vertical slices.

---

## Vertical Slice Principle

Refactor through a complete flow:

```text
route
  ↓
feature composition
  ↓
server query/action
  ↓
schema
  ↓
state ownership
  ↓
UI boundary
  ↓
tests
```

Do not independently reorganize one horizontal file category across the entire
repository unless architecture explicitly requires it.

---

## Migration Ordering

Unless scope requires another order, refactor in this sequence:

```text
architecture enforcement
        ↓
shared infrastructure boundary
        ↓
route and feature ownership
        ↓
Server/Client boundary
        ↓
data fetching
        ↓
state ownership
        ↓
feature internals
        ↓
local cleanup
```

Do not optimize leaf components while their ownership or runtime boundary is still
uncertain.

---

# Phase 3 — MIGRATE

Implement one approved migration slice at a time.

Prefer:

```text
introduce target structure
        ↓
redirect existing callers
        ↓
verify behavior
        ↓
remove obsolete structure
```

This is an expand-migrate-contract strategy.

It is preferable to moving several responsibilities simultaneously because it limits
the number of broken intermediate states.

---

## Refactoring Constraints

During implementation:

* preserve route URLs;
* preserve search parameter semantics;
* preserve OpenAPI operations;
* preserve cache policy;
* preserve revalidation semantics;
* preserve error-code semantics;
* preserve pagination cursor behavior;
* preserve session and CSRF behavior;
* preserve authorization non-disclosure;
* preserve accessibility behavior;
* preserve rendering behavior unless explicitly requested otherwise;
* preserve server/client responsibility unless intentionally correcting a violation.

If behavior must change to complete the refactor, stop and identify the change
separately from the structural refactor.

---

# Phase 4 — VERIFY

Verification is not equivalent to running unit tests.

Every refactoring slice must be verified across four dimensions.

## Behavioral Correctness

Verify that the refactor preserves:

* route behavior;
* visible states;
* interaction behavior;
* query and mutation behavior;
* server action semantics;
* loading states;
* error states;
* empty states;
* navigation;
* URL representation;
* expected accessibility behavior.

## Type Correctness

Run the project's TypeScript validation.

No refactor may weaken strictness to make migrated code compile.

Do not introduce:

* `any` as an escape hatch;
* unsafe type assertions replacing runtime parsing;
* unchecked index access assumptions;
* weakened domain types.

## Architecture Correctness

Verify:

* import boundaries;
* dependency direction;
* no new cycles;
* no forbidden feature imports;
* no server/client boundary leaks;
* no illegal API client usage;
* no illegal session access;
* no illegal React Query imports;
* no server-side store imports.

Use configured lint and dependency graph gates.

## Runtime Correctness

When relevant verify:

* production build;
* client bundle impact;
* Server Component retention;
* caching behavior;
* revalidation behavior;
* generated contract types;
* route behavior under production compilation.

A misplaced `"use client"` can pass unit tests and type checking while producing an
architecture regression. Production build and bundle checks therefore matter.

---

# Core Architecture Invariants

The following constraints are non-negotiable unless the architecture itself is
formally changed.

## Layer Direction

The target architecture is:

```text
app/
  ↓
features/
  ↓
lib/
  ↓
components/
```

Interpret this as responsibility direction rather than permission for arbitrary imports.

Apply the more specific import rules from Feature Structure when they override the
simplified diagram.

---

## App Layer

`app/` is the composition root.

It owns:

* routes;
* layouts;
* route-level loading states;
* route-level error boundaries;
* not-found boundaries;
* route handlers;
* cross-feature page composition.

It does not own reusable business logic.

A page should read primarily as a description of the screen.

When a page accumulates domain transformation or reusable conditional behavior, move
that responsibility into the owning feature.

---

## Feature Boundary

Features follow API domains.

A feature owns domain-specific:

* components;
* server queries;
* server actions;
* response schemas;
* URL handling;
* exported feature types.

A feature must not import another feature directly.

Cross-feature composition belongs in `app/`.

Do not solve feature-to-feature dependency problems by creating a generic shared
domain component.

---

## Component Layer

`components/ui` contains design-system primitives with no domain knowledge.

`components/layout` contains shared layout composition.

Shared UI must not fetch domain data.

A reusable component that understands a domain concept is not automatically a design
system component.

---

## Server First

Components are Server Components by default.

A Client Component must exist only because it needs at least one genuine client
capability, such as:

* interactivity;
* browser APIs;
* a client-only UI primitive;
* motion behavior.

Place `"use client"` on the smallest practical leaf.

Do not place `"use client"` on pages or large sections for convenience.

---

## Client Boundary Containment

Interactive client shells should accept server-rendered `children` where appropriate.

Do not pull server-renderable subtrees into the client bundle merely because a parent
interaction exists.

Do not perform general data fetching beneath a client boundary.

---

## API Boundary

The browser must not call `ecp-api` directly.

The frontend server is the API caller.

The central API client belongs to the designated server-only infrastructure.

Do not create parallel fetch clients.

Do not bypass the central API client for convenience.

---

## Session Boundary

Session custody belongs to the designated session infrastructure.

Do not:

* read authentication cookies throughout feature code;
* expose access or refresh tokens to client JavaScript;
* move tokens into localStorage, sessionStorage, or IndexedDB;
* serialize server credentials through RSC props;
* implement authorization decisions in frontend state.

Role information may influence presentation but is not authority.

---

## Data Parsing

Generated API types are compile-time descriptions, not runtime validation.

Network responses must be parsed at the API boundary according to the feature's schema
strategy.

Do not move runtime validation deep into presentation components.

Do not coerce malformed network responses into partial models.

---

## Money

Money is display data on the frontend.

Preserve money amounts as strings according to the shared contract.

Do not introduce client-side monetary arithmetic.

Totals and authoritative monetary calculations belong to the backend.

---

## Identifiers

Domain identifiers are opaque.

Preserve branded or otherwise distinguished identifier types.

Do not parse, numerically compare, order, or reconstruct identifiers.

---

## State Ownership

Do not move state into Zustand, React state, React Query, URL parameters, or server
state without classifying it first.

State ownership is an architecture decision.

Use the project's state-management rules to determine ownership.

---

## Client Cache

Client caching is restricted to the explicitly permitted interaction classes defined
by Data Fetching.

Do not introduce React Query merely to standardize fetching.

Background refetching must not be introduced casually against eventually consistent
read models.

---

## Errors

Preserve typed error semantics.

Do not collapse distinct backend states into one generic UI error.

In particular preserve distinctions between:

* authentication expiry;
* invalidated session;
* forbidden account action;
* not-found/non-disclosure;
* inventory conflict;
* promotion conflict;
* idempotency conflict;
* validation failure;
* semantic impossibility;
* rate limiting;
* dependency degradation;
* unexpected server failure.

Expected business conflicts are designed UI states, not generic exceptions.

---

## Sectional Degradation

Independent remote sections should fail independently where the architecture requires
sectional degradation.

Do not convert a local reviews, recommendation, reporting, or similar failure into an
unnecessary whole-page failure.

---

# Architecture Before Abstraction

When choosing between:

```text
small duplication + correct boundary
```

and:

```text
shared abstraction + illegal coupling
```

choose the first.

Only graduate code into shared components when it is genuinely domain-neutral.

Do not create `shared`, `common`, or `utils` dumping grounds.

Every extracted module needs a clear owner and permitted dependency direction.

---

# Stop Conditions

Stop the current migration and report instead of guessing when:

* target ownership is ambiguous in normative architecture;
* two architecture rules appear to conflict;
* the refactor requires changing a public API contract;
* the refactor requires changing an ADR-backed decision;
* the refactor requires changing authentication/session semantics;
* observable business behavior must change;
* the scope would cross multiple unrelated domains;
* tests reveal existing behavior that contradicts specification;
* generated API contracts and implementation materially disagree.

Use:

```text
ARCHITECTURAL DECISION REQUIRED
```

or:

```text
BEHAVIOR CHANGE REQUIRED
```

as appropriate.

---

# Definition of Done

A refactoring slice is complete only when all three conditions hold.

## Structural Correctness

Code has correct ownership, dependencies, and runtime boundaries.

## Behavioral Equivalence

Observable behavior is preserved except for explicitly approved changes.

## Mechanical Proof

Applicable lint, type, test, dependency, contract, and build gates pass.

The completion statement should never be:

> The code is cleaner.

It should be:

> The migrated slice is closer to the documented architecture, its external behavior
> is preserved, and the applicable repository gates provide mechanical evidence that
> the relevant invariants still hold.

---

# Required Final Report

At the end of each migration slice report:

```text
Scope
Architecture findings addressed
Files changed
Responsibilities moved
Behavior preserved
Validation executed
Remaining risks
Deferred findings
Next safe migration slice
```

Do not hide unresolved findings.

Do not silently expand the original scope.
