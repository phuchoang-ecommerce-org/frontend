
# `references/verification-checklist.md`

# Frontend Feature Verification Checklist

## Purpose

This checklist defines the evidence required before an ECP frontend feature
is considered complete.

Apply relevant sections.

Do not claim checks were performed when they were not.

---

# 1. Contract Verification

```text
[ ] Required backend operation exists.

[ ] Request matches OpenAPI.

[ ] Response matches OpenAPI.

[ ] Runtime parsing is present where required.

[ ] Error codes are handled according to the shared contract.

[ ] Permission assumptions match the Permission Matrix.

[ ] Frontend did not invent additional backend semantics.
```

---

# 2. Route Verification

```text
[ ] Feature belongs to the correct route.

[ ] Route group is correct.

[ ] Rendering class is preserved.

[ ] Route cache behavior is correct.

[ ] Layout composition is correct.

[ ] New routes agree with Routing.md.
```

---

# 3. Feature Boundary Verification

```text
[ ] Code belongs to the correct feature.

[ ] No feature imports another feature's internals.

[ ] Cross-feature composition occurs in app.

[ ] Shared code is genuinely shared.

[ ] Boundary lint/architecture rules pass.
```

---

# 4. Server / Client Verification

```text
[ ] Server Components remain the default.

[ ] Every "use client" boundary has a browser-interaction reason.

[ ] Client boundaries are as narrow as practical.

[ ] Server-only code cannot enter browser bundles.

[ ] Sensitive server data is not passed unnecessarily to Client Components.
```

---

# 5. API Access Verification

```text
[ ] Browser never calls ecp-api directly.

[ ] Backend requests use the approved lib/api layer.

[ ] Correlation behavior is preserved.

[ ] Timeouts follow Data Fetching.

[ ] Read retry follows Data Fetching.

[ ] Writes are not automatically retried unsafely.
```

---

# 6. State Verification

```text
[ ] Every meaningful state value has an owner.

[ ] Server data remains server-owned.

[ ] Shareable state lives in the URL.

[ ] Local interaction state remains local.

[ ] Zustand contains only approved client-owned state.

[ ] No token is stored in browser-managed state.

[ ] No authoritative permission is stored as client authority.

[ ] Cart contents are not duplicated into global client state.

[ ] Order/payment/authoritative-stock state is not treated as stale client
    authority.

[ ] Derived values are not unnecessarily stored.
```

---

# 7. Client Cache Verification

```text
[ ] React Query is used only for an approved case.

[ ] Client cache is not introduced for ordinary server data.

[ ] Query invalidation is defined.

[ ] Staleness is compatible with business requirements.

[ ] Zero-lag state is not served as stale client data.
```

---

# 8. Cache Verification

```text
[ ] Every backend read has explicit cache semantics.

[ ] Per-user/authoritative reads use the required policy.

[ ] Cache tags/keys follow project rules where applicable.

[ ] Canonical revalidation path is used.

[ ] No competing invalidation architecture was introduced.

[ ] Time fallback remains only the intended resilience mechanism.
```

---

# 9. Mutation Verification

```text
[ ] Mutation uses the approved server-side path.

[ ] CSRF requirements are preserved.

[ ] Session custody remains server-side.

[ ] Required idempotency key exists.

[ ] Same logical retry preserves idempotency identity.

[ ] Unknown outcome is not incorrectly rendered as confirmed failure.

[ ] Successful mutation triggers the correct revalidation behavior.
```

---

# 10. Form Verification

```text
[ ] Form state is local.

[ ] Client validation is treated as feedback rather than authority.

[ ] Server field errors map to controls.

[ ] Labels and error relationships are accessible.

[ ] Submission state prevents accidental duplicate interaction where required.
```

---

# 11. Failure Verification

```text
[ ] Loading state exists where required.

[ ] Empty state is intentional.

[ ] Validation failure has designed UI.

[ ] Retryable conflict has actionable UI.

[ ] Non-retryable business rejection is distinct.

[ ] Rate limiting respects Retry-After.

[ ] Optional dependency failure degrades at the correct section boundary.

[ ] Unexpected server error reaches the intended error boundary.

[ ] Correlation ID can be surfaced for support where specified.

[ ] Stack traces/server exception objects are not exposed.
```

---

# 12. Security Verification

```text
[ ] Access/refresh tokens are not exposed to browser JavaScript.

[ ] Role hints are not treated as authorization.

[ ] Middleware does not make authorization decisions.

[ ] Middleware does not introduce backend round trips.

[ ] Backend remains authoritative for permissions.

[ ] Client bundles contain no server secrets.

[ ] CSP-compatible implementation is preserved.

[ ] Sensitive error details are not rendered.
```

---

# 13. URL Verification

```text
[ ] Search/filter/sort state follows the URL encoding contract.

[ ] Reload preserves expected state.

[ ] Browser back/forward behavior is correct.

[ ] URL state is not duplicated into Zustand.

[ ] Invalid URL values degrade according to the documented policy.
```

---

# 14. Accessibility Verification

```text
[ ] Semantic elements are used.

[ ] Keyboard interaction works.

[ ] Focus state is visible.

[ ] Modal/dialog focus management is correct.

[ ] Controls have accessible names.

[ ] Form errors are associated with controls.

[ ] Dynamic changes are communicated where needed.

[ ] Reduced-motion preference is respected.

[ ] Colour contrast follows the design system.
```

---

# 15. Design-System Verification

```text
[ ] Existing primitives were reused where applicable.

[ ] Design tokens are used.

[ ] Spacing follows the system.

[ ] Typography follows the system.

[ ] Responsive behavior follows the system.

[ ] Feature does not introduce a local visual language.

[ ] Motion is restrained and purposeful.
```

---

# 16. Performance Verification

```text
[ ] Route performance class was identified.

[ ] New client JavaScript is justified.

[ ] New dependency size is justified.

[ ] Large Client Component boundaries were avoided.

[ ] Images follow the asset strategy.

[ ] Font strategy remains unchanged unless architecture explicitly changes.

[ ] Unnecessary request waterfalls were avoided.

[ ] Applicable performance/bundle gates pass.
```

---

# 17. Type and Contract Verification

```text
[ ] TypeScript strict checks pass.

[ ] Generated API types remain in sync.

[ ] Runtime schemas align with intended responses.

[ ] No unsafe cast hides a contract disagreement.

[ ] OpenAPI codegen/check gate passes where applicable.
```

---

# 18. Test Verification

Apply the repository's actual test strategy.

Potential evidence includes:

```text
component test
Server Action test
schema/parser test
URL encoding test
state-store test
error mapping test
accessibility test
integration test
E2E flow
```

Do not create tests solely to increase file-level coverage.

Test the architectural or user risk.

---

# 19. CI Verification

Run applicable repository gates, such as:

```text
lint
typecheck
tests
OpenAPI contract/codegen check
architecture boundary checks
production build
bundle/performance checks
```

Use actual repository commands.

---

# 20. Read Flow Trace

For a read feature verify:

```text
Browser Request
     ↓
Route
     ↓
Server Component
     ↓
Feature Query
     ↓
lib/api
     ↓
ecp-api
     ↓
Runtime Parser
     ↓
UI
```

Identify any deviation explicitly.

---

# 21. Mutation Flow Trace

For a mutation verify:

```text
Browser Interaction
       ↓
Form / Client Interaction
       ↓
Server Action
       ↓
CSRF + Session + Idempotency
       ↓
lib/api
       ↓
ecp-api
       ↓
Typed Result / Problem
       ↓
Revalidation
       ↓
Updated UI
```

---

# 22. Final Questions

Before declaring the feature complete answer:

```text
Which user capability is implemented?

Which route owns it?

Which feature owns it?

Which backend operations support it?

Which parts are Server Components?

Why does every Client Component need to be client-side?

Who owns each state value?

What data is authoritative?

What can be stale?

What cache policy applies?

How is a mutation protected?

How does revalidation occur?

What happens on 400?

What happens on 409?

What happens on 422?

What happens on 429?

What happens on 503?

What happens on 5xx?

What happens when an optional section fails?

Which accessibility requirements apply?

Which performance budget applies?

Which architecture gate prevents boundary regression?
```

---

# 23. Verification Summary Format

For substantial features produce:

```markdown
# Frontend Verification Summary

## Contract
PASS / BLOCKED / NOT APPLICABLE

Evidence:
- ...

## Architecture
PASS / BLOCKED / NOT APPLICABLE

Evidence:
- ...

## Data and State
PASS / BLOCKED / NOT APPLICABLE

Evidence:
- ...

## Security
PASS / BLOCKED / NOT APPLICABLE

Evidence:
- ...

## UI and Accessibility
PASS / BLOCKED / NOT APPLICABLE

Evidence:
- ...

## Performance
PASS / BLOCKED / NOT APPLICABLE

Evidence:
- ...

## Tests
PASS / BLOCKED / NOT APPLICABLE

Evidence:
- ...

## Remaining Risks
- ...
```

---

# 24. Definition of Verified

A frontend feature is verified when sufficient evidence demonstrates that:

```text
the intended user capability works;

backend contracts are consumed correctly;

frontend architectural boundaries remain valid;

server/client responsibilities remain intentional;

state ownership remains unambiguous;

cache and consistency semantics remain correct;

security custody is preserved;

expected failures have designed outcomes;

accessibility requirements are satisfied;

performance constraints remain valid;

and applicable CI architecture gates pass.
```

