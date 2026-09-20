# templates/refactor-report.md

# Frontend Refactor Report

## Migration Slice

```text
ID:
Name:
Status:
```

---

## Changes Performed

Describe responsibilities moved rather than merely files edited.

---

## Architecture Improvement

Explain which architecture violation or structural debt was removed.

---

## Behavior Preservation

Describe the user-visible and contract behavior verified as unchanged.

---

## Files Changed

```text
...
```

---

## Validation Results

| Gate                 | Result                           | Notes |
| -------------------- | -------------------------------- | ----- |
| Lint                 | PASS / FAIL / NOT EXECUTED / N/A |       |
| Typecheck            |                                  |       |
| Unit/component tests |                                  |       |
| Architecture checks  |                                  |       |
| Contract/codegen     |                                  |       |
| Integration tests    |                                  |       |
| Playwright           |                                  |       |
| Production build     |                                  |       |

---

## Remaining Risks

List actual remaining risks.

Do not write `None` automatically.

---

## Deferred Findings

List problems discovered but intentionally left outside the current slice.

---

## Architectural Decisions Required

```text
None.
```

or document unresolved decisions.

---

## Recommended Next Slice

Name only the next bounded migration that logically follows this one.

Do not broaden the recommendation into a repository-wide rewrite.
