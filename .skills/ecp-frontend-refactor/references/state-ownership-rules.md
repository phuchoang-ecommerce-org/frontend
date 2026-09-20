# references/state-ownership-rules.md

## Purpose

Prevent state migration from becoming accidental architecture redesign.

---

## Classification First

Before moving state, classify it.

Possible categories include:

```text
URL state
server state
client ephemeral state
shared client UI state
authoritative remote state
advisory remote state
```

Do not choose a state library before determining ownership.

---

## URL State

State that represents navigation or shareable filtering belongs in the URL when defined
by the feature's URL contract.

Do not duplicate URL state into a second authoritative store.

---

## Server State

Server-derived data remains server-owned unless the architecture explicitly assigns a
client interaction cache.

Do not copy server truth into Zustand for convenience.

---

## Client Ephemeral State

Use local component state for transient interaction where possible.

Examples:

* open/closed state;
* temporary input interaction;
* selected visual tab where navigation semantics do not require URL ownership.

Do not globalize local interaction state without a real cross-tree requirement.

---

## Shared Client Store

Use the project's approved shared client store only for the responsibilities assigned
to it.

Do not turn the store into a general cache of backend entities.

---

## React Query

React Query is not the default representation of server state in this architecture.

Its usage must remain restricted to approved browser-owned flows.

---
