import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { sessionStore, type StoredSession } from "./store";

const stored: StoredSession = {
  accessToken: "access",
  refreshToken: "refresh",
  expiresIn: 900,
  expiresAt: Date.now() + 900_000,
  account: {
    id: "customer-id",
    email: "customer@example.com",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    roles: ["CUSTOMER"],
    createdAt: "2026-10-27T00:00:00Z",
  },
};

describe("session store selection", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses the process-local adapter for the dev profile", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ECP_FRONTEND_PROFILE", "dev");
    vi.stubEnv("ECP_SESSION_REDIS_URL", "");
    const store = sessionStore();

    await store.set("session-id", stored);
    await expect(store.get("session-id")).resolves.toEqual(stored);
    await expect(store.acquireRefreshLock("session-id", "owner-a")).resolves.toBe(true);
    await expect(store.acquireRefreshLock("session-id", "owner-b")).resolves.toBe(false);
    await store.releaseRefreshLock("session-id", "owner-a");
    await expect(store.acquireRefreshLock("session-id", "owner-b")).resolves.toBe(true);
    await store.delete("session-id");
  });

  it("fails closed when production has no shared session store", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ECP_FRONTEND_PROFILE", "prod");
    vi.stubEnv("ECP_SESSION_REDIS_URL", "");

    expect(() => sessionStore()).toThrow(/ECP_SESSION_REDIS_URL/);
  });

  it("fails closed for an unprofiled production process", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ECP_FRONTEND_PROFILE", undefined);
    vi.stubEnv("ECP_SESSION_REDIS_URL", "");

    expect(() => sessionStore()).toThrow(/ECP_SESSION_REDIS_URL/);
  });
});
