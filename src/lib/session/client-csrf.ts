const CSRF_COOKIE = "ecp_csrf";

function cookieToken(): string | null {
  const prefix = `${CSRF_COOKIE}=`;
  const value = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return value ? decodeURIComponent(value.slice(prefix.length)) : null;
}

export async function csrfToken(): Promise<string> {
  const existing = cookieToken();
  if (existing) return existing;
  const response = await fetch("/api/csrf", {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });
  if (!response.ok) throw new Error("CSRF token could not be issued");
  const value: unknown = await response.json();
  if (
    typeof value !== "object" ||
    value === null ||
    !("token" in value) ||
    typeof value.token !== "string"
  ) {
    throw new Error("CSRF token response was invalid");
  }
  return value.token;
}
