# workflows/audit.md

## Objective

Understand the current implementation before proposing or making changes.

An audit produces evidence, not code changes.

---

## Input

Required:

```text
refactor scope
repository code
frontend architecture documentation
shared API and integration contracts
existing tests
```

Optional:

```text
known maintenance problem
previous refactor plan
known architectural violation
performance or bundle evidence
```

---

## Procedure

### 1. Establish the Scope Boundary

Record:

```text
primary route or feature
entry points
affected feature domains
shared infrastructure involved
neighboring code explicitly out of scope
```

Do not expand scope merely because additional debt is discovered.

Record unrelated debt under deferred findings.

---

### 2. Build a Current Structural Map

Identify:

```text
routes
layouts
pages
feature components
shared components
server modules
client modules
queries
actions
schemas
URL modules
stores
API infrastructure
session infrastructure
tests
```

---

### 3. Trace Runtime Paths

For every important user path, trace the actual execution path.

For a read:

```text
browser request
  ↓
route
  ↓
Server Component
  ↓
feature query
  ↓
API client
  ↓
ecp-api
```

For a mutation:

```text
browser interaction
  ↓
client leaf
  ↓
Server Action
  ↓
CSRF/session wrapper
  ↓
API client
  ↓
ecp-api
```

Record deviations from the intended model.

---

### 4. Build the Dependency Map

Inspect:

```text
app -> feature
feature -> feature
feature -> lib
feature -> components
components -> feature
server -> stores
client -> server-only
```

Identify:

* illegal imports;
* suspicious shared abstractions;
* cycles;
* unnecessary dependency edges.

---

### 5. Identify Runtime Boundaries

Mark every:

```text
"use client"
import "server-only"
Suspense boundary
error boundary
client cache boundary
```

Determine whether each boundary is correctly located.

---

### 6. Identify State Ownership

For each meaningful piece of state identify its authoritative owner.

Use:

```text
URL
server
component
shared client store
permitted React Query cache
```

Flag duplicated authority.

---

### 7. Identify Contract-Sensitive Behavior

Record current behavior for:

```text
route URLs
search params
API operations
cache policy
revalidation
pagination
error mapping
idempotency
session handling
CSRF
accessibility
```

These become preservation constraints for the migration plan.

---

## Audit Output

Use the following structure:

```markdown
# Frontend Refactor Audit

## Scope

## Current Architecture

## Runtime Paths

## Architecture Violations

## Structural Debt

## Local Maintainability Debt

## Contract-Sensitive Behavior

## Risk Areas

## Deferred Findings

## Candidate Migration Slices
```

For every architecture violation provide:

```text
Evidence
Current responsibility
Violated invariant
Target responsibility
Refactoring direction
Risk
```

Do not propose implementation detail beyond what is necessary to define a safe target.

---