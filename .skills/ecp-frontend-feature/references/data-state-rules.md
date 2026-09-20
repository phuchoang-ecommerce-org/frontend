# `references/data-state-rules.md`

# Frontend Data and State Rules

## Purpose

This reference governs API access, runtime parsing, cache behavior, mutations,
state placement, React Query, Zustand, forms, and URL state.

---

# 1. Sole API Caller Rule

`ecp-web` server-side code is the backend API caller.

Do not implement:

```text
browser fetch
    ↓
ecp-api
```

Use:

```text
frontend server
    ↓
lib/api
    ↓
ecp-api
```

---

# 2. `lib/api` Rule

Backend access belongs in the shared server-only API boundary.

It centralizes platform behavior such as:

```text
credentials
correlation
timeouts
retry rules
problem parsing
runtime validation
cache controls
```

Do not create `fetch()` wrappers per feature.

---

# 3. Runtime Parsing

Compile-time TypeScript types do not validate remote responses.

Use the project's runtime parsing mechanism at the network boundary.

Do not spread schema validation throughout rendering components.

---

# 4. Read Retry

Reads may only use the retry behavior defined by Data Fetching.

Do not introduce arbitrary exponential retry at feature level.

In particular distinguish:

```text
safe read retry
```

from:

```text
unsafe mutation retry
```

---

# 5. Write Retry

Do not automatically retry writes.

A lost response does not prove the backend operation failed.

For idempotent commercial operations reuse the same logical idempotency
identity according to the contract.

---

# 6. State Classification Algorithm

Ask in this exact conceptual order.

## Question 1

Did the data originate from the backend?

If yes:

```text
SERVER DATA
```

Keep it server-owned unless it falls into an explicitly approved client-cache
case.

## Question 2

Would the user reasonably bookmark, share, navigate back to, or reload into
this state?

If yes:

```text
URL STATE
```

## Question 3

Does one local interaction own it?

If yes:

```text
LOCAL STATE
```

## Question 4

Is it genuinely client-owned, shared across unrelated routes, and none of the
above?

If yes:

```text
GLOBAL CLIENT STATE
```

---

# 7. State Duplication Rule

Never duplicate the same state across owners without a documented
synchronization mechanism.

Avoid:

```text
URL filters
+
Zustand filters
```

or:

```text
server cart
+
global cart state
```

This creates competing authorities.

---

# 8. URL State

Use URL state for navigational/shareable concerns according to the documented
encoding contract.

Typical examples include:

```text
filters
sorting
pagination/search position
search query
```

Do not duplicate them into global state simply to avoid parsing search
parameters.

---

# 9. Local State

Use local React state for UI concerns owned by a nearby component.

Examples may include:

```text
drawer open/closed
temporary selection
interaction state
local draft UI state
```

Lift state only as high as it is actually shared.

---

# 10. Form State

Form state is local.

Forms submit through the project's server mutation mechanism.

A form library may be used when the form complexity warrants it.

Using a form library does not create a new state-ownership category.

---

# 11. Global Client State

Use the approved Zustand store only for state satisfying the global-client
classification.

Do not place into the global store:

```text
access tokens
refresh tokens
authoritative permissions
orders
payment state
authoritative stock
cart contents
URL filters/sorting
derived values
```

---

# 12. Client Server-Data Cache

The project intentionally limits client-side server-data caching.

Use React Query only for explicitly approved cases.

A new case requires architectural review.

Do not interpret React Query availability as permission to move ordinary
Server Component fetching into the browser.

---

# 13. Authoritative Data

Data involved in an authoritative business decision must use the documented
authoritative path.

Do not make:

```text
checkout
payment
authoritative order state
stock commitment
```

depend on stale browser copies.

---

# 14. Advisory Data

Advisory data may be displayed where the architecture allows bounded
staleness.

Presentation must not imply a stronger guarantee.

For example:

```text
availability display
```

must not be treated as:

```text
guaranteed stock reservation
```

unless the backend has confirmed that fact.

---

# 15. Cache Policy

Every read must declare an explicit policy.

Consider:

```text
public cacheable data
per-user data
authoritative data
projected/advisory data
```

Cache policy is part of correctness.

---

# 16. Revalidation

Use the revalidation mechanism defined for the resource.

Do not create competing invalidation channels.

Where event-driven revalidation is canonical, use it as canonical.

Time-based expiration may remain a resilience fallback where specified.

---

# 17. Idempotency

Where the backend requires idempotency:

```text
one logical user attempt
=
one idempotency identity
```

Do not generate a new identity merely because the frontend did not receive a
response.

---

# 18. Error Mapping

Backend error meaning must survive the frontend boundary.

Distinguish where required:

```text
400 validation

409 retryable conflict

422 non-retryable business rejection

429 rate limit

503 dependency unavailable

5xx unexpected server failure
```

Do not reduce these states to one generic toast.

---

# 19. Rate Limit Behavior

When receiving a documented rate-limit response:

```text
honour Retry-After
```

and prevent immediate repeated requests according to the UI contract.

Do not create uncontrolled client retry loops.

---

# 20. Sectional Failure

Optional remote sections should degrade independently where specified.

A recommendation or review failure should not automatically destroy the
critical commerce page that contains it.

---

# 21. Data Design Checklist

For every remote value answer:

```text
Who owns it?

Where is the authoritative source?

What consistency does it have?

What cache policy applies?

Does runtime validation apply?

Can it safely live in browser memory?

Can it become stale?

How is it invalidated?

What does failure mean?

What does retry mean?
```

