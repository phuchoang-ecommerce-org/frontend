import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { cookieJar } = vi.hoisted(() => ({
  cookieJar: new Map<string, { value: string }>(),
}));

vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      get: (name: string) => cookieJar.get(name),
      has: (name: string) => cookieJar.has(name),
      set: (name: string, value: string) => {
        cookieJar.set(name, { value });
      },
      delete: (name: string) => {
        cookieJar.delete(name);
      },
    }),
}));

const renewSessionMock = vi.fn<(refreshToken: string) => Promise<unknown>>();
vi.mock("./renew", () => ({
  renewSession: (refreshToken: string) => renewSessionMock(refreshToken),
}));

import {
  createSession,
  destroySession,
  getAccessToken,
  getCsrfToken,
  getRefreshToken,
  refreshSession,
  refreshCurrentSession,
  requireCsrf,
  CsrfError,
  SESSION_COOKIE_NAME,
  CSRF_COOKIE_NAME,
} from "./index";
import { createInMemorySessionStore } from "./store";

beforeEach(() => {
  process.env.CSRF_SECRET = "test-secret";
  cookieJar.clear();
  renewSessionMock.mockReset();
});

afterEach(() => {
  delete process.env.CSRF_SECRET;
});

describe("createSession / destroySession", () => {
  it("sets both cookies and makes the access token retrievable", async () => {
    await createSession({
      accessToken: "at-1",
      refreshToken: "rt-1",
      expiresIn: 3600,
      account: { id: "a1" },
    });
    expect(cookieJar.has(SESSION_COOKIE_NAME)).toBe(true);
    expect(cookieJar.has(CSRF_COOKIE_NAME)).toBe(true);
    await expect(getAccessToken()).resolves.toBe("at-1");
  });

  it("clears both cookies and the access token", async () => {
    await createSession({ accessToken: "at-1", expiresIn: 3600, account: { id: "a1" } });
    await destroySession();
    expect(cookieJar.has(SESSION_COOKIE_NAME)).toBe(false);
    expect(cookieJar.has(CSRF_COOKIE_NAME)).toBe(false);
    await expect(getAccessToken()).resolves.toBeNull();
  });

  it("getRefreshToken reflects the session's stored refresh token", async () => {
    await createSession({ accessToken: "at-1", refreshToken: "rt-1", expiresIn: 3600, account: {} });
    await expect(getRefreshToken()).resolves.toBe("rt-1");
  });
});

describe("getAccessToken", () => {
  it("returns null when there is no session", async () => {
    await expect(getAccessToken()).resolves.toBeNull();
  });

  it("triggers a refresh when the stored token has already expired", async () => {
    renewSessionMock.mockResolvedValue({ accessToken: "at-2", refreshToken: "rt-2", expiresIn: 3600 });
    await createSession({ accessToken: "at-1", refreshToken: "rt-1", expiresIn: -1, account: {} });

    await expect(getAccessToken()).resolves.toBe("at-2");
    expect(renewSessionMock).toHaveBeenCalledTimes(1);
    expect(renewSessionMock).toHaveBeenCalledWith("rt-1");
  });

  it("destroys the session when renewal is rejected (reuse/expired refresh token)", async () => {
    renewSessionMock.mockResolvedValue(null);
    await createSession({ accessToken: "at-1", refreshToken: "rt-1", expiresIn: -1, account: {} });

    await expect(getAccessToken()).resolves.toBeNull();
  });
});

describe("refreshCurrentSession — reactive path (lib/api/client.ts's retry-after-401)", () => {
  it("refreshes when the store still holds the token the backend just rejected", async () => {
    renewSessionMock.mockResolvedValue({ accessToken: "at-2", refreshToken: "rt-2", expiresIn: 3600 });
    await createSession({ accessToken: "at-1", refreshToken: "rt-1", expiresIn: 3600, account: {} });

    await expect(refreshCurrentSession("at-1")).resolves.toBe("at-2");
    expect(renewSessionMock).toHaveBeenCalledTimes(1);
  });

  it("short-circuits without a network call if the store already moved past the rejected token", async () => {
    renewSessionMock.mockResolvedValue({ accessToken: "at-2", refreshToken: "rt-2", expiresIn: 3600 });
    await createSession({ accessToken: "at-1", refreshToken: "rt-1", expiresIn: 3600, account: {} });

    await expect(refreshCurrentSession("a-token-someone-else-already-rejected")).resolves.toBe("at-1");
    expect(renewSessionMock).not.toHaveBeenCalled();
  });
});

/**
 * Serialised refresh (Frontend Architecture.md §4.2, ADR-0016 §5) — the
 * property required by EN-FE-API-2 and sprint-04-authorisation.md: "a test
 * drives concurrent requests and asserts one renewSession call." This runs
 * against a local stub (renewSessionMock), never Prism — Prism cannot model
 * token expiry/rotation/reuse-rejection, so it can't exercise this path.
 * Real end-to-end verification of refresh serialisation under concurrent
 * load against ecp-api is deferred to IH-1 (Integration Risk, same doc) and
 * must be stated as such at Sprint Review — this test proves the lock
 * logic, not the session contract holding end to end.
 */
describe("refreshSession — serialised refresh under concurrency", () => {
  it("N concurrent callers against one expired session trigger exactly one renewSession call", async () => {
    let renewCallCount = 0;
    renewSessionMock.mockImplementation(async () => {
      renewCallCount += 1;
      // Artificial delay so the concurrent callers actually overlap rather
      // than resolving one at a time by coincidence.
      await new Promise((resolve) => setTimeout(resolve, 20));
      return { accessToken: `at-renewed-${renewCallCount}`, refreshToken: "rt-2", expiresIn: 3600 };
    });

    const testStore = createInMemorySessionStore();
    const sessionId = "concurrent-session";
    testStore.set(sessionId, {
      accessToken: "at-stale",
      refreshToken: "rt-1",
      expiresAt: Date.now() - 1_000,
      csrfToken: "csrf-token.sig",
      account: {},
    });

    const results = await Promise.all(
      Array.from({ length: 10 }, () => refreshSession(sessionId, undefined, testStore)),
    );

    expect(renewCallCount).toBe(1);
    expect(new Set(results)).toEqual(new Set(["at-renewed-1"]));
    expect(testStore.get(sessionId)?.accessToken).toBe("at-renewed-1");
  });

  it("a caller behind a lock that never releases (timeout) gets null, not a hang", async () => {
    const testStore = createInMemorySessionStore();
    const sessionId = "stuck-session";
    testStore.set(sessionId, {
      accessToken: "at-stale",
      refreshToken: "rt-1",
      expiresAt: Date.now() - 1_000,
      csrfToken: "csrf-token.sig",
      account: {},
    });

    // Hold the lock forever (simulating a stuck holder) by never letting
    // this call's renewSession resolve.
    renewSessionMock.mockImplementation(() => new Promise(() => {}));
    void refreshSession(sessionId, undefined, testStore);

    // Direct acquireLock with a short timeout, bypassing refreshSession's
    // own (much longer) production timeout, to keep this test fast.
    const release = await testStore.acquireLock(sessionId, 30);
    expect(release).toBeNull();
  });
});

describe("requireCsrf", () => {
  it("throws CsrfError when no cookie exists yet", async () => {
    await expect(requireCsrf("anything")).rejects.toBeInstanceOf(CsrfError);
  });

  it("throws CsrfError on a mismatched submitted value", async () => {
    await createSession({ accessToken: "at-1", expiresIn: 3600, account: {} });
    await expect(requireCsrf("not-the-cookie-value")).rejects.toBeInstanceOf(CsrfError);
  });

  it("succeeds when the submitted value matches the cookie exactly", async () => {
    await createSession({ accessToken: "at-1", expiresIn: 3600, account: {} });
    const csrf = await getCsrfToken();
    await expect(requireCsrf(csrf ?? undefined)).resolves.toBeUndefined();
  });
});
