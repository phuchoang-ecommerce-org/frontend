# references/server-client-boundary.md

## Purpose

Use this file when refactoring React component boundaries.

---

## Default

Every component is a Server Component unless a concrete client capability requires
otherwise.

---

## Valid Reasons for a Client Component

A component may require `"use client"` when it directly needs:

* event-driven browser interaction;
* browser-only APIs;
* client-side hooks;
* a client-only Radix primitive;
* animation requiring a client runtime.

The fact that a descendant needs interaction is not enough to make every ancestor a
Client Component.

---

## Boundary Minimization

Place `"use client"` at the smallest practical leaf.

Prefer:

```text
ServerPage
  ↓
ServerSection
  ↓
InteractiveClientLeaf
```

over:

```text
ClientPage
  ↓
everything else
```

---

## Interactive Shell Pattern

Where possible:

```text
ClientShell
  children = server-rendered content
```

rather than:

```text
ClientShell
  imports server-renderable feature content
```

This prevents the client boundary from propagating unnecessarily.

---

## Refactoring Smell

Treat the following as suspect:

```text
"use client"

export default function Page(...)
```

unless the route itself genuinely requires a browser-only runtime.

A page-level client boundary requires explicit justification.

---

## Data Access

Do not move ordinary data fetching into a Client Component simply because a component
became interactive.

Client components should receive server data through props unless they belong to one
of the explicitly permitted client-owned remote-state scenarios.

---

## Verification

After changing a server/client boundary:

* typecheck;
* lint;
* production build;
* inspect applicable bundle budgets;
* verify no server-only import crossed into a client subtree.

---
