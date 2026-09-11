// Next.js 16 renamed `middleware.ts` to `proxy.ts` (the `middleware` export
// to `proxy`) — this file is intentionally not named middleware.ts.
//
// Exactly four responsibilities, per Routing.md §11, and no more:
//   1. Security headers + a per-request CSP nonce (R2-R4 only — R1 stays
//      static/SRI-verified, see lib/observability/csp.ts).
//   2. Thread or mint X-Correlation-Id.
//   3. Redirect unauthenticated callers away from /account and /admin, with
//      a return path.
//   4. Cookie posture selection (Strict under /admin, Lax elsewhere) — see
//      note near the bottom; not actively set here.
//
// Proxy makes no API call. It reads the session cookie's presence, not its
// meaning — an operator role is never checked here. That check belongs to
// ecp-api on every request; a redirect looks like a permission check, which
// is exactly threat T9 (Security.md §13). Treating this redirect as
// authorisation is the failure T9 exists to name.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { CORRELATION_ID_HEADER, newCorrelationId } from "@/lib/observability";
import { buildNonceCsp, isR1Path, newNonce } from "@/lib/observability/csp";
import { SESSION_COOKIE_NAME } from "@/lib/session";

const PROTECTED_PREFIXES = ["/account", "/admin"] as const;

export function requiresSession(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (requiresSession(pathname) && !request.cookies.has(SESSION_COOKIE_NAME)) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const correlationId = request.headers.get(CORRELATION_ID_HEADER) ?? newCorrelationId();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CORRELATION_ID_HEADER, correlationId);

  // R1 (home, category, product) gets no nonce — it stays static and is
  // verified by SRI instead (next.config.ts, Performance.md §7).
  const nonce = isR1Path(pathname) ? null : newNonce();
  if (nonce) {
    requestHeaders.set("x-nonce", nonce);
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(CORRELATION_ID_HEADER, correlationId);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  if (nonce) {
    response.headers.set(
      "Content-Security-Policy",
      buildNonceCsp(nonce, process.env.NODE_ENV === "development"),
    );
  }

  // Cookie SameSite posture (Strict under /admin, Lax elsewhere) is a
  // property of how the session cookie gets *issued*, not read — proxy
  // doesn't set cookies here. lib/session's SESSION_COOKIE_NAME is where
  // that posture will be applied once real cookie issuance lands (Sprint
  // 1's provisional no-op seam is still in place).

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
