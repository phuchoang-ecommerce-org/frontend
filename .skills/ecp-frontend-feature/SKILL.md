---
name: ecp-frontend-implementer
---
# `SKILL.md`

# ECP Frontend Feature Implementation Skill

## Purpose

This skill defines how an engineering agent must analyze, design, implement,
and verify frontend features in the Enterprise Commerce Platform (ECP).

It applies to work involving:

* Next.js App Router routes;
* Server Components;
* Client Components;
* frontend features;
* server-side API access;
* Server Actions;
* forms and mutations;
* URL state;
* local client state;
* approved global client state;
* approved client-side server-data caching;
* cache and revalidation;
* error and loading boundaries;
* session-related presentation;
* accessibility;
* frontend performance;
* UI design-system compliance;
* frontend architecture verification.

This skill does not define backend business behavior.

The frontend consumes backend contracts.

It must not invent missing backend operations, aggregate backend data that
requires a backend read model, or become an alternative source of business
truth.

---

# 1. Core Principle

ECP frontend implementation is architecture-driven rather than
component-driven.

Do not begin with:

```text
Which React component should I build?
```

Begin with:

```text
Which route owns this user capability?

Which frontend feature owns it?

Which backend contract supports it?

Who owns the data?

Where must the rendering boundary live?

What consistency does the user need?
```

The default reasoning chain is:

```text
User Capability
      ↓
Route
      ↓
Frontend Feature
      ↓
Backend Contract
      ↓
Data Ownership
      ↓
Rendering Strategy
      ↓
Fetch / Mutation Strategy
      ↓
State Ownership
      ↓
Cache / Revalidation
      ↓
Failure / Security Behavior
      ↓
UI / Accessibility / Performance
      ↓
Implementation
      ↓
Verification
```

---

# 2. Frontend Architectural Position

`ecp-web` is the frontend application boundary between the browser and
`ecp-api`.

The canonical architecture is:

```text
Browser
   │
   ▼
ecp-web
Next.js
   │
   ▼
lib/api
   │
   ▼
ecp-api
```

The browser must not become another direct `ecp-api` client.

The frontend must preserve the server-side custody model defined by ECP.

---

# 3. Required References

Use the following references according to the requested feature:

```text
references/document-authority.md

references/frontend-architecture-map.md

references/feature-implementation-workflow.md

references/data-state-rules.md

references/structure-rendering-rules.md

references/ui-performance-rules.md

references/verification-checklist.md
```

Do not load every reference mechanically.

Load the documents relevant to the architectural dimensions touched by the
feature.

---

# 4. Mandatory Reasoning Pipeline

Every non-trivial frontend feature follows:

```text
CLASSIFY
   ↓
TRACE
   ↓
LOCATE
   ↓
CLASSIFY DATA
   ↓
DESIGN BOUNDARIES
   ↓
DESIGN INTERACTION
   ↓
IMPACT
   ↓
IMPLEMENT
   ↓
VERIFY
```

---

# 5. CLASSIFY

Determine what the requested frontend feature contains.

Possible classifications include:

```text
NEW_ROUTE

ROUTE_CHANGE

SERVER_READ

SERVER_MUTATION

FORM

CLIENT_INTERACTION

URL_STATE

LOCAL_STATE

GLOBAL_CLIENT_STATE

APPROVED_CLIENT_CACHE

CACHE_REVALIDATION

SESSION_FLOW

ERROR_BOUNDARY

LOADING_BOUNDARY

CROSS_FEATURE_COMPOSITION

ADMIN_FEATURE

PERFORMANCE_SENSITIVE_ROUTE

ACCESSIBILITY_SENSITIVE_INTERACTION
```

A feature may have multiple classifications.

---

# 6. TRACE

Trace the requested UI behavior to the existing system contract.

Determine:

```text
user capability
route
backend operation
request contract
response contract
error contract
permission requirement
consistency requirement
```

The frontend surfaces the contract.

It does not extend it.

If the required screen needs backend data that no existing operation exposes,
report:

```text
BACKEND CONTRACT GAP
```

Do not solve it by creating an uncontrolled frontend aggregation layer.

---

# 7. LOCATE

Identify frontend ownership.

Determine:

```text
route group
route
frontend feature
composition owner
shared component if applicable
server query
server action
client boundary
```

Do not place code based only on proximity to an existing component.

Ownership follows frontend architecture.

---

# 8. CLASSIFY DATA

Before choosing state or fetching technology, classify every important piece
of data.

Use this order:

```text
1. Did it come from the backend?
      → Server data

2. Would the user reasonably bookmark, share, or reload into it?
      → URL state

3. Does one local interaction own it?
      → Local component state

4. Is it genuinely client-owned and shared across unrelated routes?
      → Approved global client state
```

The first valid classification wins.

Never move server data into global client state merely because several
components need it.

---

# 9. Server-First Rule

Server Components are the default.

Use Client Components only where browser-side interaction actually requires
them.

Prefer:

```text
Server Component
      ↓
small Client Component
```

over:

```text
large Client Component subtree
```

Push `"use client"` toward the interactive leaf.

---

# 10. API Access Rule

All backend access must use the designated frontend API layer.

Conceptually:

```text
Server Component / Server Action
             ↓
          lib/api
             ↓
          ecp-api
```

Do not introduce:

```text
browser → ecp-api
```

or feature-specific raw backend clients.

The common API layer exists so that behavior such as:

```text
session attachment
correlation
timeout
retry policy
problem parsing
response validation
cache policy
```

remains centralized.

---

# 11. Contract Rule

Generated TypeScript types are not runtime proof that an HTTP response
matches the contract.

Backend responses must follow the project's runtime boundary-validation
strategy.

Do not silently coerce malformed backend data into a successful UI state.

A runtime schema disagreement is a contract failure.

---

# 12. State Rule

Do not ask:

```text
Should this go in Zustand?
```

Ask:

```text
Who owns this state?
```

Server-owned business data remains server-owned.

Shareable navigation state belongs in the URL.

Ephemeral interaction state belongs close to the component that owns it.

Global client state is reserved for intentionally client-owned concerns.

---

# 13. Client Cache Rule

Client-side server-data caching is not the default.

Use React Query only for the explicitly approved architectural cases.

Do not add React Query because:

```text
the page is interactive;
polling looks convenient;
a component needs refetch;
or client fetching seems easier.
```

A new client-cache category is an architecture change.

---

# 14. Mutation Rule

Backend mutations normally execute through Server Actions or another
explicitly approved server-side boundary.

The write path must preserve:

```text
session custody
CSRF protection
idempotency semantics
typed problem handling
revalidation behavior
```

Do not create feature-specific mutation clients that reproduce those concerns.

---

# 15. Retry Rule

Reads and writes have different retry semantics.

Never apply generic automatic retry logic to commercial mutations.

For operations such as order placement or payment initiation distinguish:

```text
confirmed failure
```

from:

```text
unknown outcome
```

A retry of the same logical operation must preserve the intended idempotency
identity where the backend contract requires it.

---

# 16. Cache Rule

Every remote read must have an intentional cache policy.

Do not rely on accidental framework defaults.

Determine whether the data is:

```text
cacheable

bounded-staleness advisory data

authoritative or user-specific data
```

and apply the policy defined by the frontend architecture.

---

# 17. Consistency Rule

Do not present eventual or advisory data as authoritative.

In particular, where the architecture requires zero permitted lag for a
business decision, do not serve the decision from stale client state or stale
frontend cache.

The UI must represent the consistency model honestly.

---

# 18. Revalidation Rule

Use the canonical revalidation mechanism defined by ECP.

Do not create multiple independent invalidation paths for the same business
change.

If catalog data is invalidated through the documented event-driven mechanism,
do not add a second mutation-specific invalidation architecture without an
accepted decision.

---

# 19. Feature Boundary Rule

The primary dependency direction is:

```text
app
 ↓
features
 ↓
shared infrastructure / components
```

A feature must not import another feature's internals.

Cross-feature screen composition belongs in `app`.

Do not solve cross-feature requirements by creating sideways feature
dependencies.

---

# 20. Backend Module Independence

Frontend features follow frontend/API-facing capability boundaries.

They do not need to mirror backend Gradle modules exactly.

Do not reorganize frontend code simply because backend module boundaries
change internally while the external contract remains unchanged.

---

# 21. Authorization Rule

Frontend behavior is not authoritative authorization.

Examples such as:

```text
hidden navigation
disabled button
route redirect
admin shell
```

are presentation or routing behavior.

`ecp-api` remains responsible for authorization.

Do not interpret middleware or frontend role hints as permission enforcement.

---

# 22. Middleware Rule

Middleware remains limited to its documented responsibilities.

Do not move:

```text
business authorization
backend permission decisions
session validation round trips
feature data fetching
```

into middleware.

Middleware is not an application service.

---

# 23. Error Rule

Frontend failures must preserve backend failure meaning.

Do not collapse all errors into:

```text
Something went wrong.
```

Differentiate where the contract differentiates:

```text
validation failure
business conflict
unprocessable business condition
rate limit
dependency unavailable
unexpected server failure
```

Use section-level degradation where the architecture requires it rather than
failing an entire page for an optional dependency.

---

# 24. Form Rule

Form state is local.

Forms normally submit through Server Actions.

Client-side validation improves feedback.

It is not the authoritative validation boundary.

Server validation remains authoritative.

Field errors returned through the shared error contract must map to their
corresponding controls where applicable.

---

# 25. Money Rule

Do not lose monetary precision in frontend representation.

Do not convert authoritative decimal amounts into JavaScript floating-point
numbers merely for convenience.

Follow the shared contract and formatting rules.

---

# 26. UI Rule

Frontend feature implementation must use the existing design system.

Do not introduce visual conventions independently inside a feature.

Preserve:

```text
design tokens
spacing scale
typography
component primitives
motion rules
responsive behavior
accessibility baseline
Ma design philosophy
```

A functional feature that ignores the design system is incomplete.

---

# 27. Accessibility Rule

Accessibility is implementation correctness.

Interactive behavior must preserve appropriate:

```text
semantic structure
keyboard operation
focus behavior
accessible names
form labeling
error association
loading announcements where necessary
motion preferences
contrast requirements
```

Do not postpone accessibility as cosmetic cleanup.

---

# 28. Performance Rule

Before adding client-side complexity determine the route's performance class
and budget.

Treat additions such as:

```text
"use client"
large dependencies
client data caches
additional fonts
large imagery
blocking waterfalls
```

as performance decisions.

Do not optimize local development convenience by violating the route budget.

---

# 29. Minimal Change Principle

Implement the smallest coherent feature that satisfies the contract.

Do not introduce:

```text
new global store slices
new client data layer
new fetch wrapper
new design-system abstraction
new route handler
new middleware responsibility
new backend aggregation
new cross-feature dependency
```

unless architecture requires it.

---

# 30. Impact Analysis

Before coding determine whether the feature affects:

```text
Route
Route Group
Rendering Class
Feature Boundary
Server / Client Boundary
Backend Contract
API Parsing
Cache Policy
State Ownership
URL Contract
Server Action
Idempotency
Revalidation
Error Boundary
Loading Boundary
Session Behavior
Security
Design System
Accessibility
Performance Budget
Tests
```

---

# 31. Required Pre-Implementation Output

For substantial features produce:

```markdown
# Frontend Feature Analysis

## 1. User Intent

## 2. Route and Feature Ownership

## 3. Backend Contracts

## 4. Data Classification

## 5. Rendering Model

## 6. Fetch and Mutation Model

## 7. State Model

## 8. Cache and Revalidation

## 9. Failure and Security Behavior

## 10. UI, Accessibility and Performance

## 11. Implementation Steps

## 12. Verification

## 13. Risks

## 14. Non-Goals

## Implementation Contract

### Must Preserve

### Must Implement

### Must Not Introduce

### Required Verification
```

---

# 32. Definition of a Correct Frontend Feature

A frontend feature is correct when it:

```text
surfaces an existing backend contract correctly;

belongs to the correct route and feature;

preserves server-side session custody;

uses Server Components by default;

introduces Client Components only where interaction requires them;

keeps data in the correct ownership location;

uses explicit cache semantics;

preserves backend consistency semantics;

does not invent authorization;

respects feature import boundaries;

handles expected failure modes intentionally;

uses the design system;

is accessible;

stays within relevant performance constraints;

and passes applicable architecture and verification gates.
```
