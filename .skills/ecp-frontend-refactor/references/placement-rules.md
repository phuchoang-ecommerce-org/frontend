# references/placement-rules.md

## Purpose

Use this file whenever code ownership is unclear.

Placement decisions are made by responsibility, not by file size.

---

## Decision Procedure

Ask the following questions in order.

### Is it route composition?

Place it in:

```text
app/
```

Examples:

* composing catalog and review sections;
* choosing route-level Suspense boundaries;
* choosing route-level not-found handling;
* route metadata;
* route layouts.

### Does it express a domain concept?

Place it in:

```text
features/<domain>/
```

Examples:

* product filters;
* cart line interaction;
* payment status presentation;
* promotion state;
* order timeline;
* account profile form.

### Is it network, credential, or observability infrastructure?

Place it in:

```text
lib/
```

Examples:

* API fetch client;
* session custody;
* correlation ID handling;
* generic formatting with no domain ownership.

### Is it a domain-neutral UI primitive?

Place it in:

```text
components/ui/
```

Examples:

* Button;
* Input;
* Card;
* Dialog;
* Table;
* Tooltip;
* Badge primitive.

### Is it shared layout composition?

Place it in:

```text
components/layout/
```

only when it remains free of feature and API knowledge.

---

## When Placement Is Still Unclear

The code likely contains multiple responsibilities.

Split it before deciding where it belongs.

Do not create a generic shared folder merely to avoid choosing ownership.

---

## Component Graduation Rule

A feature component may move into shared UI only when:

* more than one feature needs the behavior;
* it has no domain meaning;
* it imports no feature code;
* it imports no API client;
* its props are expressed as generic presentation values;
* its behavior remains useful without a commerce-domain interpretation.

Similarity alone is insufficient.

---
