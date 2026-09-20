# references/security-invariants.md

## Purpose

Prevent structural cleanup from weakening the security model.

---

## Trusted Frontend Server

The Next.js server is part of the trusted computing base.

It holds security-sensitive server-side session material.

Refactoring its infrastructure is security-relevant.

---

## Token Custody

Never move access or refresh tokens into:

* client props;
* RSC payloads;
* localStorage;
* sessionStorage;
* IndexedDB;
* URL parameters;
* URL fragments;
* client-managed Authorization headers.

---

## Session Cookie

The browser session identifier remains opaque.

Feature code must not directly become responsible for session-cookie interpretation.

---

## CSRF

Cookie-authenticated mutations remain CSRF protected.

Do not remove or bypass the shared action wrapper during mutation refactoring.

Server Actions are not exempt from CSRF requirements.

---

## Authorization

Frontend presentation is not authorization.

Hiding a control is a UX decision.

Backend response remains authoritative.

Do not convert a UI role check into an authorization gate.

---

## Non-Disclosure

Preserve ownership non-disclosure.

When a contract intentionally maps an inaccessible resource to `404`, the refactored UI
must not expose that the resource exists.

---

## Logging

Do not log sensitive session or token material while introducing diagnostics.

Do not serialize raw server exceptions into client error reporting.

---
