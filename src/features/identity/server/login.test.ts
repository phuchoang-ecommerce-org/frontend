import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieMocks = vi.hoisted(() => ({
  guestCartId: undefined as string | undefined,
  delete: vi.fn(),
}));
const dependencyMocks = vi.hoisted(() => ({
  requestSession: vi.fn(),
  createSession: vi.fn(),
  checkActionOrigin: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) =>
      name === "ecp_guest_cart" && cookieMocks.guestCartId
        ? { name, value: cookieMocks.guestCartId }
        : undefined,
    delete: cookieMocks.delete,
  })),
}));
vi.mock("@/lib/api/identity", () => ({
  requestSession: dependencyMocks.requestSession,
  parseBackendSession: (value: unknown) => value,
}));
vi.mock("@/lib/session", () => ({
  createSession: dependencyMocks.createSession,
}));
vi.mock("@/lib/session/csrf", () => ({
  checkActionOrigin: dependencyMocks.checkActionOrigin,
}));

import { signInWithCredentials } from "./login";

const session = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  expiresIn: 900,
  account: {
    id: "customer-id",
    email: "customer@example.com",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    roles: ["CUSTOMER"],
    createdAt: "2026-10-27T00:00:00Z",
  },
};

function successfulLogin(
  options: { setCookie?: string; notices?: string[] } = {},
): Response {
  return new Response(
    JSON.stringify({ ...session, cartMergeNotices: options.notices ?? [] }),
    {
      status: 201,
      ...(options.setCookie
        ? { headers: { "Set-Cookie": options.setCookie } }
        : {}),
    },
  );
}

describe("signInWithCredentials guest cart migration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieMocks.guestCartId = undefined;
    dependencyMocks.checkActionOrigin.mockResolvedValue(true);
  });

  it("forwards the guest cart and removes its browser cookie after a successful merge", async () => {
    cookieMocks.guestCartId = "guest-cart-id";
    dependencyMocks.requestSession.mockResolvedValue(
      successfulLogin({
        setCookie:
          "ecp_guest_cart=; Path=/api/v1/carts; Max-Age=0; Secure; HttpOnly; SameSite=Lax",
      }),
    );

    const result = await signInWithCredentials(
      "customer@example.com",
      "password",
    );

    expect(result).toEqual({ ok: true });
    expect(dependencyMocks.requestSession).toHaveBeenCalledWith(
      "customer@example.com",
      "password",
      "guest-cart-id",
    );
    expect(dependencyMocks.createSession).toHaveBeenCalledWith(
      expect.objectContaining(session),
    );
    expect(cookieMocks.delete).toHaveBeenCalledWith("ecp_guest_cart");
  });

  it("keeps login successful and preserves the guest cart when merging fails", async () => {
    const notice =
      "Your guest cart could not be recovered yet; retrying sign-in will recover your items.";
    cookieMocks.guestCartId = "guest-cart-id";
    dependencyMocks.requestSession.mockResolvedValue(
      successfulLogin({ notices: [notice] }),
    );

    const result = await signInWithCredentials(
      "customer@example.com",
      "password",
    );

    expect(result).toEqual({ ok: true });
    expect(dependencyMocks.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ cartMergeNotices: [notice] }),
    );
    expect(cookieMocks.delete).not.toHaveBeenCalled();
  });

  it("logs in normally when no guest cart exists", async () => {
    dependencyMocks.requestSession.mockResolvedValue(successfulLogin());

    const result = await signInWithCredentials(
      "customer@example.com",
      "password",
    );

    expect(result).toEqual({ ok: true });
    expect(dependencyMocks.requestSession).toHaveBeenCalledWith(
      "customer@example.com",
      "password",
      undefined,
    );
    expect(cookieMocks.delete).not.toHaveBeenCalled();
  });
});
