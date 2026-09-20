# `references/ui-performance-rules.md`

# UI, Accessibility and Performance Rules

## Purpose

This reference governs visual implementation, accessibility, responsive
behavior, motion, assets, and frontend performance.

---

# 1. Design System Rule

Use the ECP UI Design System as the source for frontend visual decisions.

Do not create feature-local design languages.

Reuse existing:

```text
tokens
typography
spacing
radii
component primitives
interaction patterns
```

before introducing new primitives.

---

# 2. Ma Design Principle

ECP's visual philosophy favors deliberate simplicity.

Implementation should avoid unnecessary:

```text
decoration
visual density
competing accents
motion
UI chrome
```

Whitespace is an intentional layout tool.

Do not interpret minimalism as missing hierarchy or weak affordances.

---

# 3. Accessibility

Accessibility requirements apply during implementation.

Verify:

```text
semantic HTML
keyboard access
visible focus
accessible names
labels
error relationships
dialog focus management
dynamic-state communication
motion preferences
contrast
```

Prefer accessible primitives already provided by the design system.

---

# 4. Forms

Each form control requires an accessible relationship between:

```text
label
control
description where applicable
validation error
```

Backend-returned field errors must be surfaced at the relevant input when the
contract permits it.

---

# 5. Interactive Components

For:

```text
dialog
menu
popover
tabs
combobox
accordion
```

prefer established accessible primitives instead of reimplementing keyboard
and focus behavior from scratch.

---

# 6. Motion

Motion must be restrained and purposeful.

Do not add animation simply to make the interface appear more dynamic.

Respect reduced-motion preferences according to the design-system baseline.

---

# 7. Responsive Design

Feature implementation must work within the documented responsive strategy.

Do not build a desktop-only structure and treat mobile behavior as later
cleanup.

Content priority should survive viewport changes.

---

# 8. Route Performance

Determine the route performance class before introducing material browser
cost.

Consider:

```text
initial JavaScript
hydration cost
image payload
font payload
data waterfalls
third-party dependencies
client cache libraries
```

---

# 9. Bundle Discipline

Avoid importing large libraries when:

```text
the platform already provides the capability;

the design system already contains the primitive;

or a small local implementation satisfies the requirement safely.
```

Do not convert server-side code into a client dependency accidentally.

---

# 10. Image Discipline

Use the project's image strategy.

Provide:

```text
appropriate sizing
responsive behavior
layout stability
meaningful alternatives where required
```

Do not allow decorative imagery to dominate critical performance paths.

---

# 11. Font Discipline

Follow the documented font strategy.

Do not add feature-local web fonts.

Typography is a design-system concern, not feature ownership.

---

# 12. Streaming and Boundaries

Use route/section loading behavior according to the rendering architecture.

Independent remote sections should be capable of independent loading or
degradation where this improves the specified availability behavior.

Avoid serial waterfalls that are not required by data dependency.

---

# 13. Performance Verification

For material changes consider:

```text
bundle analysis
Lighthouse or documented synthetic checks
route budgets
RUM where applicable
image budget
client JavaScript budget
```

Use the actual repository gates.

Do not invent alternative thresholds.
