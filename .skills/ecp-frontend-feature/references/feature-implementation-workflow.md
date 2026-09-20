# `references/feature-implementation-workflow.md`

# Frontend Feature Implementation Workflow

## Purpose

This document defines the operational workflow for implementing an ECP
frontend feature.

The goal is to make architectural decisions before component implementation.

---

# 1. Phase 1 — Normalize the User Capability

Translate the request into:

```text
actor
user goal
route
entry point
successful outcome
important failure outcomes
```

Do not initially describe the change in terms of React components.

---

# 2. Phase 2 — Locate the Route

Inspect `Routing.md`.

Determine:

```text
existing or new route
route group
layout
rendering class
cache behavior
authentication posture
```

Do not add a route outside the route map without identifying the required
architecture change.

---

# 3. Phase 3 — Locate Feature Ownership

Inspect `Feature Structure.md`.

Determine:

```text
owning feature
shared component needs
composition point
server-only modules
```

If multiple features appear on one page, compose them from `app`.

Do not import feature internals sideways.

---

# 4. Phase 4 — Trace Backend Contracts

Identify every backend operation needed.

For each record:

```text
operation
request
response
errors
permission
consistency requirement
```

If no backend operation supports required data, stop treating the problem as a
frontend-only implementation task.

Report:

```text
BACKEND CONTRACT GAP
```

---

# 5. Phase 5 — Classify Rendering

For each part of the feature ask:

```text
Can this render on the server?
```

If yes:

```text
Server Component
```

If it requires browser interaction:

```text
Client Component
```

Keep the boundary as narrow as practical.

---

# 6. Phase 6 — Classify Data Ownership

For each state item classify:

```text
SERVER

URL

LOCAL

GLOBAL_CLIENT
```

Do this before selecting libraries.

Never select Zustand or React Query first and then force data into their
models.

---

# 7. Phase 7 — Design Reads

For every backend read define:

```text
server query owner
lib/api operation
runtime schema
cache policy
timeout
retry semantics
consistency
failure behavior
```

Avoid remote reads hidden inside arbitrary presentational components.

---

# 8. Phase 8 — Design Mutations

For each backend mutation define:

```text
form/client trigger
Server Action
CSRF behavior
session behavior
idempotency
request validation
backend call
problem mapping
success result
revalidation
```

For commercial mutations determine explicitly what happens when the network
outcome is unknown.

---

# 9. Phase 9 — Design State

Use the state placement algorithm.

Do not duplicate:

```text
URL state in Zustand

server state in Zustand

server state in local persistent stores

derived values in global state
```

If one conceptual UI state appears difficult to place, determine whether it
actually consists of multiple pieces of state with different owners.

---

# 10. Phase 10 — Design Cache Behavior

For every read define its consistency category.

Determine:

```text
cacheable?

revalidation key/tag?

no-store?

approved client cache?

event-driven invalidation?

time fallback?
```

Do not let cache behavior emerge implicitly from framework defaults.

---

# 11. Phase 11 — Design Failure States

Enumerate:

```text
loading
empty
validation error
business conflict
permission denied
not found
rate limited
dependency unavailable
unexpected server failure
```

Determine whether failure applies to:

```text
field
component
section
page
route
```

Do not make every failure page-scoped.

---

# 12. Phase 12 — Design Security Boundaries

Check:

```text
Does browser JavaScript gain access to credentials?

Does a role hint become authority?

Does middleware perform backend authorization?

Does a client component receive unnecessary sensitive data?

Does an error expose implementation information?
```

A frontend feature must preserve the existing trust boundary.

---

# 13. Phase 13 — Design UI Structure

Use the design system.

Determine:

```text
existing primitives
layout pattern
spacing
typography
responsive behavior
focus order
keyboard interaction
loading treatment
error treatment
motion
```

Prefer reuse of existing design-system primitives over feature-local variants.

---

# 14. Phase 14 — Design Accessibility

Before implementation define accessibility behavior for:

```text
forms
dialogs
menus
tabs
dynamic updates
errors
loading
focus transition
keyboard behavior
motion
```

Do not rely on a later audit to discover fundamental interaction problems.

---

# 15. Phase 15 — Check Performance Budget

Determine route performance class.

Identify expected impact on:

```text
client JavaScript
hydration
images
fonts
third-party libraries
data waterfalls
streaming
bundle size
```

Do not add large dependencies for functionality already available through the
platform or existing design system.

---

# 16. Phase 16 — Produce Implementation Contract

Before substantial coding produce:

```markdown
## Frontend Implementation Contract

### Route

...

### Feature Owner

...

### Backend Contracts

...

### Rendering

Server:
- ...

Client:
- ...

### State Ownership

Server:
- ...

URL:
- ...

Local:
- ...

Global Client:
- ...

### Cache / Consistency

...

### Mutations

...

### Failure Boundaries

...

### Must Preserve

...

### Must Not Introduce

...

### Required Verification

...
```

---

# 17. Phase 17 — Implement From Outer Contract Inward

A useful sequence is:

```text
route
→ feature server boundary
→ backend query/action
→ runtime schema
→ server rendering
→ client interaction
→ error/loading states
→ styling/accessibility
→ tests
```

Avoid building the entire feature as a large Client Component and then trying
to recover server boundaries afterward.

---

# 18. Phase 18 — Verify End-to-End Flow

For reads trace:

```text
route
→ Server Component
→ feature query
→ lib/api
→ backend
→ runtime parsing
→ render
```

For writes trace:

```text
interaction
→ Server Action
→ CSRF/session/idempotency
→ lib/api
→ backend
→ typed result/problem
→ revalidation
→ UI
```

Check that no hidden alternate path bypasses the architecture.

---

# 19. Completion Standard

Another engineer should be able to explain:

```text
why the feature lives at this route;

why its files live in this feature;

why each Client Component must be client-side;

where every meaningful state value lives;

which backend contracts it consumes;

what is authoritative;

how cache consistency works;

how failures degrade;

and what verifies the architecture.
```
