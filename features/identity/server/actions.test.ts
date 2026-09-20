import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiMutateMock, createSessionMock, requireCsrfMock } = vi.hoisted(() => ({
  apiMutateMock: vi.fn(),
  createSessionMock: vi.fn(),
  requireCsrfMock: vi.fn(),
}));

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  apiMutate: apiMutateMock,
}));
vi.mock("@/lib/session", () => ({
  createSession: createSessionMock,
  destroySession: vi.fn(),
  getRefreshToken: vi.fn(),
  requireCsrf: requireCsrfMock,
}));

import { logIn } from "./actions";

const account = (roles: string[]) => ({
  id: "account-1",
  email: "person@example.com",
  status: "ACTIVE",
  verificationStatus: "VERIFIED",
  roles,
  createdAt: "2026-09-20T00:00:00Z",
});

function session(roles: string[]) {
  return {
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresIn: 900,
    account: account(roles),
  };
}

describe("logIn session posture", () => {
  beforeEach(() => {
    apiMutateMock.mockReset();
    createSessionMock.mockReset();
    requireCsrfMock.mockReset();
    requireCsrfMock.mockResolvedValue(undefined);
  });

  it("issues Strict cookies when the validated API account has an operator role", async () => {
    const authenticated = session(["CUSTOMER", "STAFF"]);
    apiMutateMock.mockResolvedValue(authenticated);

    const result = await logIn({
      email: "person@example.com",
      password: "correct-horse",
      csrfToken: "valid-csrf",
    });

    expect(result).toEqual({
      ok: true,
      data: {
        account: authenticated.account,
        expiresIn: authenticated.expiresIn,
      },
    });
    expect(createSessionMock).toHaveBeenCalledWith({
      accessToken: authenticated.accessToken,
      refreshToken: authenticated.refreshToken,
      expiresIn: authenticated.expiresIn,
      account: authenticated.account,
    }, { admin: true });
  });

  it("keeps a validated customer session Lax", async () => {
    const authenticated = session(["CUSTOMER"]);
    apiMutateMock.mockResolvedValue(authenticated);

    await logIn({
      email: "person@example.com",
      password: "correct-horse",
      csrfToken: "valid-csrf",
    });

    expect(createSessionMock).toHaveBeenCalledWith(expect.objectContaining({
      account: authenticated.account,
    }), { admin: false });
  });

  it("does not accept a browser-supplied role claim", async () => {
    const result = await logIn({
      email: "person@example.com",
      password: "correct-horse",
      csrfToken: "valid-csrf",
      roles: ["ADMINISTRATOR"],
    });

    expect(result.ok).toBe(false);
    expect(apiMutateMock).not.toHaveBeenCalled();
    expect(createSessionMock).not.toHaveBeenCalled();
  });
});
