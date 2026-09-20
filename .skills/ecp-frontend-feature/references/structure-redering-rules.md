# `references/structure-rendering-rules.md`

# Frontend Structure and Rendering Rules

## Purpose

This reference governs route composition, feature boundaries, Server
Components, Client Components, middleware, route handlers, and import
direction.

---

# 1. Dependency Direction

Use:

```text
app
 ↓
features
 ↓
lib / shared components
```

Do not introduce:

```text
feature A
   ↓
feature B internals
```

---

# 2. `app` Responsibility

`app` is the composition root.

It owns:

```text
route composition
layout composition
cross-feature composition
route-level loading/error boundaries
route metadata
```

Do not move feature-internal business presentation into `app` unnecessarily.

---

# 3. Feature Responsibility

A frontend feature owns UI and frontend behavior for one coherent
API/user-facing capability.

It may contain:

```text
server query functions
Server Actions
feature components
feature-specific schemas
feature-local helpers
feature tests
```

according to project conventions.

---

# 4. Cross-Feature Composition

If one screen needs:

```text
catalog
+
reviews
+
recommendations
```

the route composes those features.

Do not make:

```text
catalog feature
    imports
reviews feature
```

solely because both appear on the same page.

---

# 5. Shared Code

Move code into shared infrastructure only when its responsibility is genuinely
cross-feature and stable.

Do not create generic shared abstractions merely because two features have
similar implementation.

---

# 6. Server Component Default

Pages, layouts, and non-interactive feature sections should remain Server
Components unless interaction requires browser execution.

Server Components are not merely a performance optimization.

They preserve:

```text
server data ownership
credential isolation
smaller browser bundles
simpler data access
```

---

# 7. Client Component Rule

A Client Component must have a reason.

Valid reasons include:

```text
browser events
local interactive state
browser APIs
approved client cache
interactive third-party component
```

Do not add `"use client"` merely because child components use ordinary props.

---

# 8. Client Boundary Minimization

Prefer:

```text
Server Page
 ├── Server Product Data
 ├── Server Price
 └── Client Quantity Selector
```

instead of:

```text
Client Product Page
 ├── Product Data
 ├── Price
 └── Quantity Selector
```

when only the selector requires client execution.

---

# 9. Server-Only Rule

Modules handling:

```text
session credentials
backend API credentials
server API client
private environment values
```

must remain server-only.

Import boundaries should make accidental browser bundling fail early.

---

# 10. Middleware Rule

Middleware owns only the documented cross-cutting routing/security-header
responsibilities.

It does not:

```text
call backend APIs
resolve business authorization
fetch page data
perform application use cases
```

Presence of a session cookie can affect routing without establishing
authorization.

---

# 11. Route Handler Rule

Route handlers are not a generic substitute for Server Actions or direct
server queries.

Use only the route-handler cases explicitly permitted by frontend
architecture.

Do not create an internal BFF endpoint for every feature.

`ecp-web` already acts as the frontend server boundary.

---

# 12. Feature Contract Rule

The frontend surfaces backend capability.

If a screen needs a new domain aggregate or reporting aggregation, first
determine whether the backend needs a new read model.

Do not create hidden domain logic in frontend composition code.

---

# 13. Import Verification

Architecture tooling should detect at least the project-defined forbidden
edges.

Examples include:

```text
features/A → features/B

client module → server-only module

shared component → feature-specific backend query

arbitrary code → low-level backend API transport
```

Do not depend only on code review for structural architecture.

---

# 14. Rendering Checklist

Before adding a Client Component ask:

```text
Which browser capability requires it?

Can the parent remain server-rendered?

What data crosses the server/client boundary?

Is that data safe to expose?

Will this increase hydration significantly?

Does the interaction actually need global state?
```
