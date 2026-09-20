# `references/frontend-architecture-map.md`

# Frontend Architecture Map

## Purpose

This document provides a compact architectural map for locating frontend
feature responsibilities.

---

# 1. Runtime Shape

```text
Browser
   │
   ▼
Next.js ecp-web
   │
   ├── Server Components
   ├── Server Actions
   ├── Route Handlers where explicitly allowed
   ├── Session subsystem
   └── lib/api
          │
          ▼
       ecp-api
```

The frontend server is the API caller.

The browser is not another backend client.

---

# 2. Structural Shape

```text
app/
   │
   ├── route composition
   ├── layouts
   ├── pages
   └── boundaries
        │
        ▼
features/
        │
        ▼
lib/ + shared components
```

Cross-feature composition belongs in `app`.

---

# 3. Read Path

Canonical server read:

```text
Request
   ↓
Route / Server Component
   ↓
Feature Server Query
   ↓
lib/api
   ↓
ecp-api
   ↓
Runtime Validation
   ↓
Typed Result
   ↓
Rendering
```

---

# 4. Mutation Path

Canonical mutation:

```text
Browser Interaction
      ↓
Client Component / Form
      ↓
Server Action
      ↓
CSRF / Session / Idempotency handling
      ↓
lib/api
      ↓
ecp-api
      ↓
Typed Result / Problem
      ↓
Revalidation / UI Result
```

---

# 5. State Map

```text
API-derived data
    → server-owned

bookmarkable/shareable state
    → URL

single-interaction state
    → local component

approved genuinely client-owned shared state
    → Zustand

approved interactive remote-data exception
    → React Query
```

Do not reverse this classification.

---

# 6. Rendering Map

Default:

```text
Server Component
```

Add client interactivity as:

```text
Server Component
      ↓
Client Island
```

rather than converting the whole page to client rendering.

---

# 7. Security Map

```text
Browser
    │
    │ opaque session cookie
    ▼
ecp-web
    │
    │ resolves server-side session credentials
    ▼
ecp-api
    │
    └── authoritative authorization
```

Frontend rendering hints are not permissions.

---

# 8. Cache Map

Classify a read before applying cache behavior:

```text
public/cacheable data
        ↓
explicit framework cache policy

authoritative/user-specific data
        ↓
no-store / authoritative path

approved interactive client case
        ↓
approved client cache mechanism
```

No remote read should have accidental cache semantics.

---

# 9. Failure Map

```text
Expected business state
    → designed UI state

Field validation
    → field-level feedback

Retryable conflict
    → actionable retry UI

Non-retryable business rejection
    → terminal/action-changing UI

Optional dependency unavailable
    → sectional degradation

Unexpected server error
    → error boundary + correlation reference
```

Do not map every failure to the same page-level fallback.

---

# 10. Feature Implementation Map

For a new feature determine:

```text
Route
  ↓
Feature
  ↓
Backend Contract
  ↓
Server/Client Split
  ↓
Data Ownership
  ↓
Fetch/Mutation
  ↓
State
  ↓
Cache
  ↓
Failure Boundaries
  ↓
UI
  ↓
Verification
```

