"use client";

import { useEffect, useState } from "react";

// Must match CSRF_COOKIE_NAME in lib/session/constants.ts. Not imported —
// components/ui may not depend on lib/session (eslint boundaries I-5); the
// non-HttpOnly ecp_csrf cookie's name is small and stable enough to
// duplicate rather than relocate the constant into a shared leaf layer.
const CSRF_COOKIE_NAME = "ecp_csrf";

function readCsrfCookie(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE_NAME}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : "";
}

/**
 * Mirrors the non-HttpOnly `ecp_csrf` cookie into a hidden form field — the
 * Server-Action adaptation of signed double-submit (Frontend Architecture.md
 * §4.3): a form-bound action can't attach a custom header the way `fetch`
 * can, so the client echoes the cookie value back as a field instead. Mints
 * one via /api/csrf first if the caller has no session yet and so no cookie.
 */
export function CsrfField() {
  // Lazy initializer, not an effect: the read is synchronous and
  // client-only (guarded above), so there's nothing to synchronize after
  // mount for the common case where the cookie already exists.
  const [value, setValue] = useState(() => readCsrfCookie());

  useEffect(() => {
    if (value) return;
    fetch("/api/csrf")
      .then(() => setValue(readCsrfCookie()))
      .catch(() => {
        // Left empty — the action's own requireCsrf() rejects a missing
        // token with a retryable, non-disclosive message.
      });
  }, [value]);

  return <input type="hidden" name="csrfToken" value={value} />;
}
