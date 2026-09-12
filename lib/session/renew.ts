import "server-only";

import { randomUUID } from "node:crypto";
import { z } from "zod";

/**
 * lib/session may not depend on lib/api (eslint boundaries I-7 — session
 * custody sits beneath the fetch client, which itself depends on
 * lib/session for credentials; a reverse dependency would cycle). This file
 * is therefore a deliberately minimal, standalone fetch — duplicating a
 * small amount of lib/api/client.ts's shape rather than importing it.
 */
const REQUEST_TIMEOUT_MS = 10_000; // mirrors lib/api/config.ts's REQUEST_TIMEOUT_MS
const CORRELATION_ID_HEADER = "X-Correlation-Id"; // mirrors lib/observability/correlation-id.ts

function getApiBaseUrl(): string {
  const baseUrl = process.env.ECP_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("ECP_API_BASE_URL is not set. See .env.example.");
  }
  return baseUrl;
}

/** A loose structural check, not the full Problem schema (that lives in lib/api, off-limits here). */
const MinimalProblemSchema = z.object({ code: z.string() }).passthrough();

/**
 * Mirrors components/schemas/identity.yaml#Session (renewSession's 200
 * response) — only the fields session custody needs.
 */
const RenewalResultSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    expiresIn: z.number().int(),
  })
  .passthrough();

export type RenewalResult = z.infer<typeof RenewalResultSchema>;

export class SessionRenewalError extends Error {
  constructor(cause?: unknown) {
    super("POST /session-renewals failed");
    this.name = "SessionRenewalError";
    this.cause = cause;
  }
}

/**
 * POST /session-renewals — internal only; never exposed via a route and
 * never imported outside lib/session (`renewSession` has no customer-facing
 * surface — sprint-04-authorisation.md).
 *
 * Deliberately does not go through lib/api's client: that client attaches
 * the access token via getAccessToken(), which is exactly the function this
 * call exists to refresh — reusing it would recurse. Authentication here is
 * the refresh token in the body alone; the operation carries no `bearerAuth`
 * requirement.
 */
export async function renewSession(refreshToken: string): Promise<RenewalResult | null> {
  const base = new URL(getApiBaseUrl());
  const url = new URL(`${base.pathname.replace(/\/$/, "")}/session-renewals`, base);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, application/problem+json",
        [CORRELATION_ID_HEADER]: randomUUID(),
      },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (cause) {
    throw new SessionRenewalError(cause);
  } finally {
    clearTimeout(timeout);
  }

  const bodyText = await response.text().catch((cause: unknown) => {
    throw new SessionRenewalError(cause);
  });
  const raw: unknown =
    bodyText.length === 0
      ? undefined
      : ((): unknown => {
          try {
            return JSON.parse(bodyText);
          } catch (cause) {
            throw new SessionRenewalError(cause);
          }
        })();

  if (!response.ok) {
    // 401 ECP-GEN-4011 (reuse/expired/invalid refresh token) is the
    // expected "can't refresh" outcome, not a transport failure — the
    // caller destroys the session for it. A response that doesn't even
    // look like a Problem is a genuine contract violation.
    if (MinimalProblemSchema.safeParse(raw).success) return null;
    throw new SessionRenewalError(new Error("Malformed error response from renewSession"));
  }

  const parsed = RenewalResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new SessionRenewalError(parsed.error);
  }
  return parsed.data;
}
