# templates/migration-slice.md

# Migration Slice

## Identity

```text
ID:
Name:
Risk:
Primary owner:
```

---

## Problem

Describe exactly one structural problem.

---

## Current Structure

```text
...
```

---

## Target Structure

```text
...
```

---

## Allowed Change Surface

List files or directories that may change.

---

## Forbidden Change Surface

List neighboring areas that must remain untouched.

---

## Responsibilities Moved

| Responsibility | From | To |
| -------------- | ---- | -- |
|                |      |    |

---

## Behavior Preservation Contract

The following behavior must remain unchanged:

```text
...
```

---

## Architecture Invariants

Relevant rules:

```text
...
```

---

## Implementation Strategy

Prefer:

```text
introduce
  ↓
redirect
  ↓
verify
  ↓
remove obsolete path
```

Describe concrete implementation steps.

---

## Required Validation

```text
lint:
typecheck:
tests:
architecture:
build:
contract:
e2e:
```

Mark each as required, not applicable, or optional with justification.

---

## Exit Criteria

This slice is complete only when:

```text
target responsibility owns the behavior
old path is removed
behavior is preserved
required gates pass
no new architecture violation exists
```

---
