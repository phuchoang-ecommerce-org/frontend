import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { parseBackendSession, requestSession } from "./identity";

describe("requestSession", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("forwards the guest cart cookie while keeping it out of the credentials body", async () => {
    vi.stubEnv("ECP_API_BASE_URL", "http://backend.test/api/v1/");
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await requestSession(
      "customer@example.com",
      "correct horse battery staple",
      "guest-cart-id",
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://backend.test/api/v1/sessions",
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Cookie: "ecp_guest_cart=guest-cart-id",
        },
        body: JSON.stringify({
          email: "customer@example.com",
          password: "correct horse battery staple",
        }),
      }),
    );
  });

  it("does not send a guest cookie when the visitor has no cart", async () => {
    vi.stubEnv("ECP_API_BASE_URL", "http://backend.test/api/v1");
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await requestSession("customer@example.com", "password");

    const init = fetchMock.mock.calls.at(0)?.at(1) as RequestInit | undefined;
    expect(init?.headers).toEqual({ "Content-Type": "application/json" });
  });
});

describe("parseBackendSession", () => {
  it("accepts the contract session shape used for server-side custody", () => {
    const value = {
      accessToken: "access-token",
      refreshToken: "refresh-token",
      expiresIn: 900,
      restricted: false,
      account: {
        id: "customer-id",
        email: "customer@example.com",
        status: "ACTIVE",
        verificationStatus: "VERIFIED",
        roles: ["CUSTOMER"],
        createdAt: "2026-10-27T00:00:00Z",
      },
    };

    expect(parseBackendSession(value)).toEqual(value);
  });

  it("rejects a session without a refresh token", () => {
    expect(() =>
      parseBackendSession({
        accessToken: "access-token",
        expiresIn: 900,
        account: {},
      }),
    ).toThrow();
  });
});
