import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieMocks = vi.hoisted(() => ({
  guestCartId: undefined as string | undefined,
  delete: vi.fn(),
}));
const dependencyMocks = vi.hoisted(() => ({
  requestSession: vi.fn(),
  createSession: vi.fn(),
  checkActionCsrf: vi.fn(),
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
  checkActionCsrf: dependencyMocks.checkActionCsrf,
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
  options: {
    merged?: boolean;
  } = {},
): Response {
  return new Response(
    JSON.stringify({
      ...session,
      ...(options.merged === undefined
        ? {}
        : { cartMerge: { merged: options.merged } }),
    }),
    { status: 201 },
  );
}

describe("signInWithCredentials guest cart migration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieMocks.guestCartId = undefined;
    dependencyMocks.checkActionCsrf.mockResolvedValue(true);
  });

  it("removes the browser cookie when the contract confirms a successful merge", async () => {
    cookieMocks.guestCartId = "guest-cart-id";
    dependencyMocks.requestSession.mockResolvedValue(
      successfulLogin({ merged: true }),
    );

    const result = await signInWithCredentials(
      "customer@example.com",
      "password",
      "csrf-token",
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

  it("keeps login successful and preserves the guest cart when the merge fails", async () => {
    cookieMocks.guestCartId = "guest-cart-id";
    dependencyMocks.requestSession.mockResolvedValue(
      successfulLogin({ merged: false }),
    );

    const result = await signInWithCredentials(
      "customer@example.com",
      "password",
      "csrf-token",
    );

    expect(result).toEqual({ ok: true });
    expect(dependencyMocks.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ cartMerge: { merged: false } }),
    );
    expect(cookieMocks.delete).not.toHaveBeenCalled();
  });

  it("logs in normally when no guest cart exists", async () => {
    dependencyMocks.requestSession.mockResolvedValue(successfulLogin());

    const result = await signInWithCredentials(
      "customer@example.com",
      "password",
      "csrf-token",
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
