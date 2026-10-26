import "server-only";

export type Account = {
  id: string;
  email: string;
  displayName?: string;
  roles: string[];
};

export type BackendSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  account: Account;
  cartMergeNotices?: string[];
};

export async function requestSession(
  email: string,
  password: string,
  guestCartId?: string,
): Promise<Response> {
  const baseUrl = process.env.ECP_API_BASE_URL;
  if (!baseUrl) throw new Error("ECP_API_BASE_URL is not configured");

  return fetch(`${baseUrl.replace(/\/$/, "")}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(guestCartId
        ? { Cookie: `ecp_guest_cart=${encodeURIComponent(guestCartId)}` }
        : {}),
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
}

export async function renewSession(refreshToken: string): Promise<Response> {
  const baseUrl = process.env.ECP_API_BASE_URL;
  if (!baseUrl) throw new Error("ECP_API_BASE_URL is not configured");

  return fetch(`${baseUrl.replace(/\/$/, "")}/session-renewals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
}

export async function endSession(refreshToken: string): Promise<void> {
  const baseUrl = process.env.ECP_API_BASE_URL;
  if (!baseUrl) return;

  await fetch(`${baseUrl.replace(/\/$/, "")}/sessions/current`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
}
