# templates/refactor-plan.md

# Frontend Refactor Plan

## 1. Scope

### Primary Scope

Describe the route, feature or infrastructure area being refactored.

### Explicitly Out of Scope

List nearby areas that are not part of this effort.

---

## 2. Current Architecture Summary

Describe the current route-to-feature-to-data flow.

```text
current:
...
```

---

## 3. Target Architecture Summary

Describe the intended flow after the refactor.

```text
target:
...
```

---

## 4. Findings

| ID   | Classification | Finding | Invariant | Risk |
| ---- | -------------- | ------- | --------- | ---- |
| F-01 | Architecture   |         |           |      |
| F-02 | Structural     |         |           |      |

---

## 5. Preservation Constraints

The refactor must preserve:

* route behavior:
* URL contract:
* API operations:
* cache behavior:
* error semantics:
* state semantics:
* session/security behavior:
* accessibility behavior:

---

## 6. Migration Sequence

### Slice R1 — `<name>`

**Objective**

...

**Current responsibility**

...

**Target responsibility**

...

**Files affected**

...

**Dependency changes**

...

**Runtime boundary impact**

...

**Behavior that must remain unchanged**

...

**Validation**

...

**Rollback boundary**

...

---

### Slice R2 — `<name>`

Repeat the same structure.

---

## 7. Deferred Findings

List findings intentionally not addressed by this refactor.

---

## 8. Architectural Decisions Required

Write:

```text
None.
```

when no unresolved architecture decision exists.

Otherwise list each unresolved decision without inventing its answer.

---

## 9. Completion Criteria

The refactor is complete when:

* planned migration slices are complete;
* relevant architecture violations are removed;
* observable behavior is preserved;
* required repository gates pass;
* deferred findings are documented.

---
