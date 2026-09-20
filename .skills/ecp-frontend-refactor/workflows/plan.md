# workflows/plan.md

## Objective

Convert audit findings into an ordered, bounded migration plan.

---

## Planning Principles

Each migration slice must:

* have one primary structural objective;
* have a bounded blast radius;
* leave the repository valid;
* preserve documented behavior;
* have explicit verification;
* be independently reviewable;
* be independently revertible.

---

## Dependency Ordering

Plan foundational migrations before dependent cleanup.

Example:

```text
establish feature ownership
        ↓
move server query
        ↓
shrink client boundary
        ↓
correct state ownership
        ↓
simplify leaf components
```

Do not simplify leaves before deciding their correct owner.

---

## Migration Slice Specification

Every slice must declare:

```text
Name
Problem
Current structure
Target structure
Files affected
Responsibilities moved
Dependencies changed
Runtime boundary changed
Behavior preserved
Validation
Rollback boundary
Out-of-scope findings
```

---

## Planning Risk Classes

### Low

Examples:

* pure rename;
* internal extraction;
* moving a pure helper within the same feature.

### Medium

Examples:

* moving query ownership;
* splitting a Server Component;
* moving domain UI out of shared components;
* changing URL parser location without changing encoding.

### High

Examples:

* Server/Client boundary change;
* state ownership migration;
* Server Action restructure;
* session infrastructure;
* API client changes;
* cache semantics;
* revalidation;
* error interpretation;
* checkout/payment/order flows.

High-risk slices require stronger integration validation.

---

## Output

Use `templates/refactor-plan.md`.

Do not implement during planning mode.
