# workflows/verify.md

## Objective

Prove that the migrated slice remains correct.

---

## 1. Structural Verification

Confirm:

```text
correct ownership
legal dependency direction
no forbidden feature imports
no cycles
no illegal API access
no illegal session access
no client/server leakage
```

---

## 2. Behavioral Verification

Verify the behavior identified in the migration slice.

Examples:

* same route;
* same query parameters;
* same data requested;
* same user-facing states;
* same action result handling;
* same error handling;
* same cursor behavior;
* same accessibility interaction.

---

## 3. Type Verification

Run strict type checking.

Do not accept newly introduced:

```text
any
unsafe casting
non-null assertions hiding uncertainty
weakened optionality
```

unless already required by an explicit boundary adapter and justified.

---

## 4. Test Verification

Run the narrowest relevant test first, then applicable wider gates.

Suggested sequence:

```text
changed component tests
feature tests
typecheck
lint
architecture checks
integration tests
Playwright slice
production build
```

The exact repository scripts remain authoritative.

---

## 5. Contract Verification

When relevant verify:

```text
OpenAPI generated types unchanged or intentionally regenerated
schema parsing preserved
error codes preserved
cache semantics preserved
revalidation semantics preserved
pagination semantics preserved
```

---

## 6. Report

Use `templates/refactor-report.md`.

Do not report success if a required gate was not executed.

Distinguish:

```text
PASS
FAIL
NOT EXECUTED
NOT APPLICABLE
```

---
