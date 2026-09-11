import "server-only";

import { getAccessToken, getCsrfToken } from "@/lib/session";
import { CORRELATION_ID_HEADER, newCorrelationId } from "@/lib/observability";

export interface BuildHeadersOptions {
  correlationId: string;
  idempotencyKey?: string;
  isMutation: boolean;
}

export async function buildHeaders(options: BuildHeadersOptions): Promise<Headers> {
  const headers = new Headers();
  headers.set("Accept", "application/json, application/problem+json");
  headers.set(CORRELATION_ID_HEADER, options.correlationId);

  const accessToken = await getAccessToken();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (options.isMutation) {
    headers.set("Content-Type", "application/json");
    const csrfToken = await getCsrfToken();
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
    if (options.idempotencyKey) {
      headers.set("Idempotency-Key", options.idempotencyKey);
    }
  }

  return headers;
}

export { newCorrelationId };
