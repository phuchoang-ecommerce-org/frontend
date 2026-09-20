# references/validation-matrix.md

## Purpose

Map refactoring risk to required validation.

---

| Change                            | Required validation                                         |
| --------------------------------- | ----------------------------------------------------------- |
| File movement only                | lint, typecheck, relevant tests                             |
| Feature boundary change           | lint, typecheck, dependency graph, tests                    |
| Server/Client boundary change     | lint, typecheck, build, bundle/performance gate, tests      |
| API query movement                | typecheck, schema tests, relevant integration tests         |
| Server Action refactor            | mutation tests, CSRF/session checks, error mapping tests    |
| State ownership change            | component/integration tests, URL behavior, hydration checks |
| React Query removal/addition      | architecture lint, interaction tests, cache behavior        |
| Routing change                    | build, route tests, Playwright where applicable             |
| Error mapping change              | typed problem tests, UI-state tests                         |
| Shared UI extraction              | lint, dependency graph, accessibility tests                 |
| API generated type impact         | codegen check, typecheck                                    |
| Security-sensitive infrastructure | security tests plus applicable integration tests            |

---

## Minimum Repository Gates

Use the project's actual configured commands, but conceptually verify:

```text
lint
typecheck
unit/component tests
architecture dependency checks
OpenAPI generation consistency
relevant integration tests
relevant Playwright tests
production build
```

Do not claim validation that was not executed.

---

## Failure Handling

If a validation gate fails:

1. determine whether the failure existed before the migration;
2. determine whether the migration exposed an existing hidden defect;
3. determine whether the migration introduced a regression.

Do not silence failing architecture rules merely to complete a refactor.

Do not weaken tests to make the migration pass unless the test is demonstrably invalid
under an already-approved behavior specification.