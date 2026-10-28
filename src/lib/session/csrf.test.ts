import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const requestState = vi.hoisted(() => ({
  cookie: undefined as string | undefined,
  origin: "https://shop.example.test",
  host: "shop.example.test",
  set: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) =>
      name === "ecp_csrf" && requestState.cookie
        ? { name, value: requestState.cookie }
        : undefined,
    set: requestState.set,
  })),
  headers: vi.fn(async () => ({
    get: (name: string) => {
      if (name === "origin") return requestState.origin;
      if (name === "host") return requestState.host;
      return null;
    },
  })),
}));

import { checkActionCsrf, issueCsrfToken } from "./csrf";

describe("signed double-submit CSRF", () => {
  afterEach(() => vi.unstubAllEnvs());

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("CSRF_SECRET", "test-secret-that-is-long-enough-for-hmac-signing");
    requestState.cookie = undefined;
    requestState.origin = "https://shop.example.test";
    requestState.host = "shop.example.test";
  });

  it("accepts the signed cookie value only when the submitted value and origin match", async () => {
    const token = await issueCsrfToken();
    requestState.cookie = token;

    await expect(checkActionCsrf(token)).resolves.toBe(true);
    expect(requestState.set).toHaveBeenCalledWith(
      "ecp_csrf",
      token,
      expect.objectContaining({ httpOnly: false, secure: false, sameSite: "lax" }),
    );
  });

  it("keeps the CSRF cookie secure in the production profile", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ECP_FRONTEND_PROFILE", "prod");

    await issueCsrfToken();

    expect(requestState.set).toHaveBeenCalledWith(
      "ecp_csrf",
      expect.any(String),
      expect.objectContaining({ secure: true }),
    );
  });

  it("rejects a forged submitted token", async () => {
    const token = await issueCsrfToken();
    requestState.cookie = token;

    await expect(checkActionCsrf(`${token}x`)).resolves.toBe(false);
  });

  it("rejects a request from another origin even with a valid token", async () => {
    const token = await issueCsrfToken();
    requestState.cookie = token;
    requestState.origin = "https://attacker.example.test";

    await expect(checkActionCsrf(token)).resolves.toBe(false);
  });

  it("uses an ephemeral secret for the dev profile under next start", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ECP_FRONTEND_PROFILE", "dev");
    vi.stubEnv("CSRF_SECRET", "");

    await expect(issueCsrfToken()).resolves.toMatch(/^[^.]+\.[^.]+$/);
  });

  it("fails closed when the prod profile has no stable secret", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ECP_FRONTEND_PROFILE", "prod");
    vi.stubEnv("CSRF_SECRET", "");

    await expect(issueCsrfToken()).rejects.toThrow(/CSRF_SECRET/);
  });
});
