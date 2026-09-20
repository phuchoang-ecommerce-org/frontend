# `references/document-authority.md`

# Frontend Document Authority

## Purpose

This reference defines which ECP document owns each frontend implementation
decision.

Do not replace repository decisions with generic React or Next.js advice.

---

# 1. Authority Chain

Use:

```text
User / Business Requirement
        ↓
Use Case
        ↓
Frontend Architecture Decision
        ↓
Routing / Feature Structure
        ↓
Data Fetching / State Management
        ↓
Shared Backend Contract
        ↓
UI / Performance Specification
        ↓
Implementation
        ↓
Verification
```

---

# 2. Question Routing

| Question                               | Primary authority                            |
| -------------------------------------- | -------------------------------------------- |
| Why does the user need this behavior?  | SRS / User Story / Use Case                  |
| Which URL owns it?                     | Routing                                      |
| Which route group owns it?             | Routing                                      |
| What rendering strategy applies?       | Routing + Frontend Architecture              |
| Where should feature code live?        | Feature Structure                            |
| May one feature import another?        | Feature Structure                            |
| How is backend data fetched?           | Data Fetching                                |
| May the browser call `ecp-api`?        | Frontend Architecture + Data Fetching        |
| Where does state live?                 | State Management                             |
| May React Query be used?               | Data Fetching                                |
| How is a mutation executed?            | Data Fetching                                |
| How does frontend caching work?        | Data Fetching                                |
| What revalidation mechanism applies?   | Data Fetching                                |
| How is session custody handled?        | Frontend Architecture                        |
| What does middleware do?               | Routing / Frontend Architecture              |
| What endpoint exists?                  | OpenAPI                                      |
| What failure semantics exist?          | Error Codes + Integration Contract           |
| What permission applies?               | Permission Matrix                            |
| What design system applies?            | UI Design System                             |
| What route performance budget applies? | Performance                                  |
| What tests/gates apply?                | Testing and Benchmark Strategy + frontend CI |
| Why was the architecture chosen?       | Relevant ADR                                 |

---

# 3. Routing Authority

Use `Routing.md` for:

```text
route map
route groups
route ownership
rendering class
cache posture
role-facing navigation
route handler ownership
middleware responsibilities
```

Do not create a new route because it is convenient without checking the
canonical route map.

---

# 4. Frontend Architecture Authority

Use `Frontend Architecture.md` for:

```text
Next.js runtime model
Server Component default
session custody
trusted frontend boundary
security headers
CSP
CSRF
TypeScript expectations
toolchain
server-only boundaries
```

Architecture decisions here are not optional conventions.

---

# 5. Feature Structure Authority

Use `Feature Structure.md` for:

```text
directory ownership
dependency direction
feature isolation
cross-feature composition
shared code placement
server-only enforcement
architecture linting
```

Frontend feature boundaries are not automatically copies of backend module
boundaries.

---

# 6. Data Fetching Authority

Use `Data Fetching.md` for:

```text
lib/api usage
timeouts
retry behavior
runtime validation
cache policy
Server Actions
idempotency
client cache exceptions
event-driven revalidation
pagination
error mapping
```

Do not introduce a new data-access style locally inside a feature.

---

# 7. State Management Authority

Use `State Management.md` to classify:

```text
server data
URL state
ephemeral local state
global client state
```

State placement follows ownership.

Do not use global-store convenience as a reason to ignore ownership.

---

# 8. Shared Contract Authority

Use:

```text
OpenAPI
Error Codes
Integration Contract
Permission Matrix
```

for external backend behavior.

Frontend implementation must surface these contracts.

It must not silently redefine them.

---

# 9. UI Design System Authority

Use `UI Design System.md` for:

```text
tokens
spacing
typography
colour
component treatment
responsive behavior
motion
accessibility
visual hierarchy
```

Feature-specific styling must remain within this system.

---

# 10. Performance Authority

Use `Performance.md` for frontend route budgets and measurement.

Do not confuse frontend performance budgets with backend API NFRs.

They measure different system boundaries.

---

# 11. ADR Authority

ADRs explain accepted architectural choices.

Use them to understand decisions such as:

```text
App Router rendering
styling system
design tokens
state management
HttpOnly session custody
accessibility baseline
feature structure
sole server-side API caller
URL encoding
frontend performance CI gates
```

An implementation must not casually reopen an accepted ADR.

---

# 12. Contract Gap Rule

If a required UI cannot be supported by existing backend contracts, report:

```text
BACKEND CONTRACT GAP
```

Examples include a screen requiring an aggregate that the backend does not
expose.

Do not build an unofficial frontend read model from many unrelated backend
calls when the architecture requires a backend read model.

---

# 13. Conflict Rule

If frontend documents conflict:

1. identify the exact conflicting rules;
2. inspect associated ADR status;
3. determine whether one document operationalizes another;
4. inspect explicit supersession;
5. do not choose the interpretation that makes implementation easiest.

If unresolved, report:

```text
FRONTEND SPECIFICATION CONFLICT
```

