import { beforeEach, describe, expect, it, vi } from "vitest";

const { logOut, redirect } = vi.hoisted(() => ({
  logOut: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("./actions", () => ({ logOut }));

import { signOutFromAccount } from "./account-layout-actions";

describe("signOutFromAccount", () => {
  beforeEach(() => {
    logOut.mockReset();
    redirect.mockReset();
  });

  it("passes the sidebar CSRF field to identity logout and redirects to sign-in", async () => {
    logOut.mockResolvedValue({ ok: true });
    const formData = new FormData();
    formData.set("csrfToken", "csrf-token");

    await signOutFromAccount(formData);

    expect(logOut).toHaveBeenCalledWith({ csrfToken: "csrf-token" });
    expect(redirect).toHaveBeenCalledWith("/sign-in");
  });

  it("keeps the existing redirect behavior when logout returns a typed failure", async () => {
    logOut.mockResolvedValue({ ok: false });

    await signOutFromAccount(new FormData());

    expect(logOut).toHaveBeenCalledWith({ csrfToken: null });
    expect(redirect).toHaveBeenCalledWith("/sign-in");
  });
});
