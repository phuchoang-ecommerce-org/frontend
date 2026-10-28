import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";

export const CSRF_COOKIE = "ecp_csrf";
const CSRF_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const runtime = globalThis as typeof globalThis & {
  __ecpDevelopmentCsrfSecret?: string;
};

function secureCookie(): boolean {
  const profile = process.env.ECP_FRONTEND_PROFILE;
  return profile === "prod" || (profile === undefined && process.env.NODE_ENV === "production");
}

function csrfSecret(): string {
  const configured = process.env.CSRF_SECRET;
  if (configured) return configured;
  const profile = process.env.ECP_FRONTEND_PROFILE;
  const productionProfile =
    profile === "prod" ||
    (profile === undefined && process.env.NODE_ENV === "production");
  if (productionProfile) {
    throw new Error("CSRF_SECRET is required in production");
  }
  return (runtime.__ecpDevelopmentCsrfSecret ??= randomBytes(32).toString(
    "base64url",
  ));
}

function sign(nonce: string): string {
  return createHmac("sha256", csrfSecret()).update(nonce).digest("base64url");
}

function validSignature(token: string): boolean {
  const separator = token.indexOf(".");
  if (separator < 1) return false;
  const nonce = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = sign(nonce);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function issueCsrfToken(
  sameSite: "lax" | "strict" = "lax",
): Promise<string> {
  const nonce = randomBytes(32).toString("base64url");
  const token = `${nonce}.${sign(nonce)}`;
  (await cookies()).set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: secureCookie(),
    sameSite,
    path: "/",
    maxAge: CSRF_MAX_AGE_SECONDS,
  });
  return token;
}

export async function checkActionCsrf(presentedToken: string): Promise<boolean> {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (!origin || !host) return false;
  try {
    if (new URL(origin).host !== host) return false;
  } catch {
    return false;
  }
  const cookieToken = (await cookies()).get(CSRF_COOKIE)?.value;
  if (!cookieToken || !presentedToken || !validSignature(cookieToken)) return false;
  const left = Buffer.from(cookieToken);
  const right = Buffer.from(presentedToken);
  return left.length === right.length && timingSafeEqual(left, right);
}
