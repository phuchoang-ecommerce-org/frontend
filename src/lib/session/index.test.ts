import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const sessionId = "concurrent-refresh-session";
const renewSession = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) =>
      name === "ecp_session" ? { name, value: sessionId } : undefined,
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

vi.mock("@/lib/api/identity", () => ({
  renewSession,
  parseBackendSession: (value: unknown) => value,
}));

import { getSession } from "./index";
import { sessionStore, type StoredSession } from "./store";

const expiredSession: StoredSession = {
  accessToken: "expired-access",
  refreshToken: "refresh-1",
  expiresIn: 1,
  expiresAt: Date.now() - 1,
  account: {
    id: "customer-id",
    email: "customer@example.com",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    roles: ["CUSTOMER"],
    createdAt: "2026-10-27T00:00:00Z",
  },
};

describe("session renewal", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("ECP_SESSION_REDIS_URL", "");
    await sessionStore().set(sessionId, expiredSession);
    renewSession.mockResolvedValue(
      new Response(
        JSON.stringify({
          ...expiredSession,
          accessToken: "fresh-access",
          refreshToken: "refresh-2",
          expiresIn: 900,
        }),
        { status: 201 },
      ),
    );
  });

  it("serializes concurrent refreshes for the same session", async () => {
    const results = await Promise.all([getSession(), getSession(), getSession()]);

    expect(renewSession).toHaveBeenCalledOnce();
    expect(results.map((session) => session?.accessToken)).toEqual([
      "fresh-access",
      "fresh-access",
      "fresh-access",
    ]);
  });
});
