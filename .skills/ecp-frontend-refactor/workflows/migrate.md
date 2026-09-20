# workflows/migrate.md

## Objective

Implement exactly one migration slice from an approved refactor plan.

---

## Precondition

Do not begin unless the slice has:

```text
clear target
behavior-preservation constraints
affected files
validation requirements
```

---

## Migration Procedure

### 1. Reconfirm the Slice Boundary

Identify files permitted to change.

If another area must change unexpectedly, determine whether it is:

* a necessary dependency of the current slice;
* a separate migration slice.

Do not silently expand the task.

---

### 2. Establish Target Structure

Prefer introducing the destination before deleting the source.

Example:

```text
create target query module
        ↓
delegate existing caller
        ↓
run local validation
        ↓
remove old query path
```

---

### 3. Preserve Behavior Explicitly

Before changing each responsibility ask:

```text
What currently observable behavior depends on this?
```

Preserve it unless the migration plan explicitly states otherwise.

---

### 4. Avoid Opportunistic Cleanup

Do not simultaneously:

* rename unrelated files;
* rewrite neighboring components;
* replace libraries;
* modify design tokens;
* change API shapes;
* change routing;
* alter tests unrelated to the migrated responsibility.

Record such opportunities for later slices.

---

### 5. Remove Obsolete Paths

After callers have migrated and validation succeeds:

* remove dead implementation;
* remove obsolete imports;
* remove obsolete wrappers;
* remove duplicate state authority;
* remove stale tests only when superseded by equivalent or stronger coverage.

Do not leave parallel architecture paths behind.

---

## Output

After implementation immediately proceed to `verify.md`.

---
