import "server-only";

/**
 * The mock/real switch is this one environment variable and nothing else —
 * no `isMock` branch, no adapter (EN-MOCK-1). Unset must fail loudly, not
 * silently default somewhere.
 */
export function getApiBaseUrl(): string {
  const baseUrl = process.env.ECP_API_BASE_URL;
  if (!baseUrl) {
    throw new Error(
      "ECP_API_BASE_URL is not set. See .env.example for the mock and real values.",
    );
  }
  return baseUrl;
}

export const REQUEST_TIMEOUT_MS = 10_000;
