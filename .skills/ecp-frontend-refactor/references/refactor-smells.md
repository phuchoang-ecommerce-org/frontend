# references/refactor-smells.md

## Purpose

Provide project-specific refactoring signals.

These are not universal React rules. They identify patterns likely to conflict with
this project's architecture.

---

## Routing Smells

### Domain Logic in `page.tsx`

Symptoms:

* response transformations;
* business-state branching;
* feature-specific mapping;
* reusable validation;
* mutation orchestration.

Direction:

Move feature responsibility into the owning feature and leave page composition visible.

---

## Feature Boundary Smells

### Feature-to-Feature Import

Direction:

Move composition upward into `app/`.

Do not create another shared domain abstraction simply to hide the edge.

### Domain UI in `components/ui`

Direction:

Move domain-specific composition to its feature.

Retain only generic visual primitives in shared UI.

---

## Server/Client Smells

### Large `"use client"` Boundary

Direction:

Find the first actual client requirement and push the boundary downward.

### Client Component Fetching Ordinary Server Data

Direction:

Restore server fetching unless the interaction belongs to a permitted client-owned
case.

### Server-Only Import Reached from Client Code

Direction:

Redesign the boundary rather than bypassing `server-only`.

---

## Data Smells

### Direct `fetch` Outside API Infrastructure

Direction:

Route communication through the single API client.

### Unparsed Network Response

Direction:

Introduce or restore feature-level runtime parsing.

### Money Converted to Number

Direction:

Restore string-based money representation and backend-authoritative calculation.

### Cursor Parsing

Direction:

Pass cursor values opaquely.

---

## State Smells

### Zustand Holding Backend Entities

Direction:

Identify the actual state category and return remote truth to its server owner.

### Duplicate URL and Local Store State

Direction:

Choose the architecture-defined authority and derive the other representation.

### React Query Everywhere

Direction:

Remove usage outside permitted client-cache cases.

---

## Error Smells

### Generic Catch-All Error State

Direction:

Restore typed problem handling and expected domain-state presentation.

### Section Failure Crashes Whole Page

Direction:

Introduce or restore the appropriate sectional Suspense/error boundary.

---

## Abstraction Smells

### Generic Shared Component with Domain Imports

Direction:

Move back into a feature or split generic presentation from domain composition.

### `utils/` Contains Business Vocabulary

Direction:

Move the utility into the owning domain unless it is genuinely domain-neutral.

### Wrapper Around One Call with No Policy

Direction:

Remove unnecessary indirection unless the wrapper enforces a real invariant.

---