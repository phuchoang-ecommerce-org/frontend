import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { requestSession } from "./identity";

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
