import { beforeEach, describe, expect, it, vi } from "vitest";

const dependencyMocks = vi.hoisted(() => ({
  endSession: vi.fn(),
  endAllSessions: vi.fn(),
  clearSession: vi.fn(),
  getSession: vi.fn(),
  checkActionCsrf: vi.fn(),
}));

vi.mock("@/lib/api/identity", () => ({
  endSession: dependencyMocks.endSession,
  endAllSessions: dependencyMocks.endAllSessions,
}));
vi.mock("@/lib/session", () => ({
  clearSession: dependencyMocks.clearSession,
  getSession: dependencyMocks.getSession,
}));
vi.mock("@/lib/session/csrf", () => ({
  checkActionCsrf: dependencyMocks.checkActionCsrf,
}));

import { logoutAction, logoutAllAction } from "./logout";

const session = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

describe("logout actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dependencyMocks.checkActionCsrf.mockResolvedValue(true);
    dependencyMocks.clearSession.mockResolvedValue(session);
    dependencyMocks.getSession.mockResolvedValue(session);
  });

  it("rejects a forged CSRF submission before clearing the local session", async () => {
    dependencyMocks.checkActionCsrf.mockResolvedValue(false);

    await expect(logoutAction("forged-token")).resolves.toEqual({
      ok: false,
      message: "Sign-out request could not be verified. Reload and try again.",
    });
    expect(dependencyMocks.clearSession).not.toHaveBeenCalled();
    expect(dependencyMocks.endSession).not.toHaveBeenCalled();
  });

  it("clears the local session and records a token-free operational failure", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    dependencyMocks.endSession.mockRejectedValue(new Error("backend unavailable"));

    await expect(logoutAction("csrf-token")).resolves.toEqual({
      ok: true,
      message:
        "You have signed out on this device. The server sign-out could not be completed.",
    });
    expect(dependencyMocks.clearSession).toHaveBeenCalledOnce();
    expect(dependencyMocks.endSession).toHaveBeenCalledWith("refresh-token");
    expect(error).toHaveBeenCalledWith(
      "Backend current-session invalidation failed after local sign-out",
    );
    expect(error).not.toHaveBeenCalledWith(expect.stringContaining("refresh-token"));
    error.mockRestore();
  });

  it("keeps all-session invalidation behind the same CSRF guard", async () => {
    dependencyMocks.checkActionCsrf.mockResolvedValue(false);

    await expect(logoutAllAction("forged-token")).resolves.toEqual({
      ok: false,
      message: "Sign-out request could not be verified. Reload and try again.",
    });
    expect(dependencyMocks.getSession).not.toHaveBeenCalled();
    expect(dependencyMocks.endAllSessions).not.toHaveBeenCalled();
  });
});
