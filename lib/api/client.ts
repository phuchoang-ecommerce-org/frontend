import "server-only";

import type { z } from "zod";

import { refreshCurrentSession } from "@/lib/session";

import { getApiBaseUrl, REQUEST_TIMEOUT_MS } from "./config";
import { ApiParseError, ApiProblem, ApiTransportError } from "./errors";
import { buildHeaders, newCorrelationId } from "./headers";
import { ProblemSchema } from "./schema";

/** No credential, or the access token has expired (Error Codes.md — also used for a bad sign-in itself). */
const ACCESS_TOKEN_INVALID_CODE = "ECP-GEN-4010";

function parseRetryAfter(response: Response): number | undefined {
  const header = response.headers.get("Retry-After");
  if (!header) return undefined;
  const seconds = Number(header);
  return Number.isFinite(seconds) ? seconds : undefined;
}

type CachePolicy = RequestCache | { revalidate: number; tags?: string[] };

interface RequestOptions {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  pathParams?: Record<string, string>;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
  idempotencyKey?: string;
  /**
   * No default — an unstated cache policy is a review rejection
   * (Data Fetching.md §2.3). Every call site states its policy explicitly.
   */
  cache: CachePolicy;
  correlationId?: string;
  signal?: AbortSignal;
}

function substitutePath(path: string, pathParams?: Record<string, string>): string {
  if (!pathParams) return path;
  return path.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = pathParams[name];
    if (value === undefined) {
      throw new Error(`Missing path parameter "${name}" for ${path}`);
    }
    return encodeURIComponent(value);
  });
}

function buildUrl(path: string, query?: RequestOptions["query"]): URL {
  // `new URL("/products/x", base)` would discard base's own path (e.g. the
  // real backend's /api/v1 prefix) because path is an absolute-path
  // reference — join the two path segments ourselves instead.
  const base = new URL(getApiBaseUrl());
  const joinedPath = `${base.pathname.replace(/\/$/, "")}${path}`;
  const url = new URL(joinedPath, base);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      for (const entry of Array.isArray(value) ? value : [value]) {
        url.searchParams.append(key, entry);
      }
    }
  }
  return url;
}

function toFetchCacheInit(cache: CachePolicy): {
  cache?: RequestCache;
  next?: { revalidate: number; tags?: string[] };
} {
  if (typeof cache === "string") return { cache };
  return { next: cache };
}

async function apiRequest<TSchema extends z.ZodTypeAny>(
  options: RequestOptions,
  schema: TSchema,
  attempt = 0,
): Promise<z.infer<TSchema>> {
  const correlationId = options.correlationId ?? newCorrelationId();
  const operation = `${options.method} ${options.path}`;
  const isMutation = options.method !== "GET";
  const url = buildUrl(substitutePath(options.path, options.pathParams), options.query);
  const headers = await buildHeaders({
    correlationId,
    isMutation,
    ...(options.idempotencyKey !== undefined
      ? { idempotencyKey: options.idempotencyKey }
      : {}),
  });
  const sentAuthorization = headers.get("Authorization");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method,
      headers,
      signal: controller.signal,
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
      ...toFetchCacheInit(options.cache),
    });
  } catch (cause) {
    throw new ApiTransportError(operation, cause);
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 304) {
    // No body by contract (Integration Contract §2.1) — caller handles this
    // status explicitly rather than through the parsed-body path.
    throw new ApiTransportError(operation, new Error("304 Not Modified has no body to parse"));
  }

  // A 202/204 success carries no body (e.g. registerAccount, logOut) — only
  // parse when there's something to parse; an empty success body is `undefined`,
  // not a parse failure, and the caller states that expectation with z.void().
  const bodyText = await response.text().catch((cause: unknown) => {
    throw new ApiTransportError(operation, cause);
  });
  const raw: unknown =
    bodyText.length === 0
      ? undefined
      : ((): unknown => {
          try {
            return JSON.parse(bodyText);
          } catch (cause) {
            throw new ApiParseError(operation, correlationId, cause);
          }
        })();

  if (!response.ok) {
    const problemResult = ProblemSchema.safeParse(raw);
    if (!problemResult.success) {
      throw new ApiParseError(operation, correlationId, problemResult.error);
    }
    const problem = problemResult.data;

    // Retry exactly once: only when we actually sent a credential the
    // backend just rejected as expired/invalid — never for a call that was
    // never authenticated in the first place (e.g. logIn's own 401 on bad
    // credentials, which carries this same code — Error Codes.md).
    if (attempt === 0 && sentAuthorization && problem.code === ACCESS_TOKEN_INVALID_CODE) {
      const rejectedToken = sentAuthorization.replace(/^Bearer /, "");
      const renewed = await refreshCurrentSession(rejectedToken);
      if (renewed) {
        return apiRequest(options, schema, attempt + 1);
      }
    }

    throw new ApiProblem(problem, problem.status === 429 ? parseRetryAfter(response) : undefined);
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiParseError(operation, correlationId, parsed.error);
  }
  return parsed.data;
}

/** Reads — plain function calls from Server Components (ADR-0036). */
export function apiQuery<TSchema extends z.ZodTypeAny>(
  options: Omit<RequestOptions, "method" | "idempotencyKey">,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  return apiRequest({ ...options, method: "GET" }, schema);
}

/** Writes — composed inside Server Actions, with CSRF + idempotency (ADR-0036). */
export function apiMutate<TSchema extends z.ZodTypeAny>(
  options: Omit<RequestOptions, "method"> & {
    method: Exclude<RequestOptions["method"], "GET">;
  },
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  return apiRequest(options, schema);
}
