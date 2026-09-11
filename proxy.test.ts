import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { CORRELATION_ID_HEADER } from "@/lib/observability";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { proxy, requiresSession } from "./proxy";

describe("requiresSession", () => {
  it.each(["/account", "/account/orders", "/admin", "/admin/catalog"])(
    "requires a session for %s",
    (path) => {
      expect(requiresSession(path)).toBe(true);
    },
  );

  it.each(["/", "/p/1", "/c/1", "/sign-in", "/cart", "/accountability"])(
    "does not require a session for %s",
    (path) => {
      expect(requiresSession(path)).toBe(false);
    },
  );
});

describe("proxy", () => {
  it("redirects to /sign-in with a return path when /account has no session cookie", () => {
    const request = new NextRequest("https://example.com/account/orders");
    const response = proxy(request);
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/sign-in");
    expect(location.searchParams.get("from")).toBe("/account/orders");
  });

  it("passes through /account when the session cookie is present", () => {
    const request = new NextRequest("https://example.com/account", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=anything` },
    });
    const response = proxy(request);
    expect(response.headers.get("location")).toBeNull();
  });

  it("mints a correlation id and echoes it on the response", () => {
    const request = new NextRequest("https://example.com/");
    const response = proxy(request);
    expect(response.headers.get(CORRELATION_ID_HEADER)).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("threads an inbound correlation id instead of minting a new one", () => {
    const request = new NextRequest("https://example.com/", {
      headers: { [CORRELATION_ID_HEADER]: "11111111-1111-1111-1111-111111111111" },
    });
    const response = proxy(request);
    expect(response.headers.get(CORRELATION_ID_HEADER)).toBe(
      "11111111-1111-1111-1111-111111111111",
    );
  });

  it("sets no nonce-based CSP for an R1 path", () => {
    const request = new NextRequest("https://example.com/p/1");
    const response = proxy(request);
    expect(response.headers.get("Content-Security-Policy")).toBeNull();
  });

  it("sets a nonce-based CSP for a non-R1 path", () => {
    const request = new NextRequest("https://example.com/cart");
    const response = proxy(request);
    expect(response.headers.get("Content-Security-Policy")).toContain("nonce-");
  });
});
