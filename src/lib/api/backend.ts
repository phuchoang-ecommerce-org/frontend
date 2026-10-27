import "server-only";

import { z } from "zod";
import type { components } from "./types";

export type BackendRequestInit = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

export type ApiProblem = components["schemas"]["Problem"];

const apiProblemSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  code: z.string(),
  detail: z.string().optional(),
  instance: z.string(),
  correlationId: z.string().optional(),
  errors: z.array(
    z.object({
      field: z.string(),
      code: z.string(),
      detail: z.string().optional(),
    }),
  ),
  blocking: z
    .object({
      productCount: z.number().int().nonnegative().optional(),
      childCategoryCount: z.number().int().nonnegative().optional(),
    })
    .optional(),
});

const problemMessages: Readonly<Record<string, string>> = {
  "ECP-GEN-4000": "Check the highlighted information and try again.",
  "ECP-GEN-4010": "Your session has ended. Sign in and try again.",
  "ECP-GEN-4011": "Your session has ended. Sign in again.",
  "ECP-GEN-4030": "You do not have access to do that.",
  "ECP-GEN-4040": "The requested item could not be found.",
  "ECP-GEN-4290": "Too many requests. Wait and try again.",
  "ECP-GEN-5000": "The service could not complete the request. Try again.",
  "ECP-GEN-5030": "The service is temporarily unavailable. Try again shortly.",
  "ECP-CRT-4090": "Stock changed. Choose a lower quantity and try again.",
};

const fieldErrorMessages: Readonly<Record<string, string>> = {
  "ECP-GEN-4002": "This field is required.",
  "ECP-GEN-4003": "Check this value.",
};

export async function backendRequest(
  path: string,
  init: BackendRequestInit = {},
): Promise<Response> {
  const base = process.env.ECP_API_BASE_URL;
  if (!base) throw new Error("ECP_API_BASE_URL is not configured");
  const cache = init.cache ?? (init.next ? undefined : "no-store");
  return fetch(`${base.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
    ...(cache ? { cache } : {}),
  });
}

export async function readProblem(response: Response): Promise<ApiProblem> {
  try {
    const parsed = apiProblemSchema.safeParse(await response.json());
    if (parsed.success) return parsed.data as ApiProblem;
  } catch {
    // A malformed problem response is handled as an unknown server failure.
  }
  return {
    type: "about:blank",
    title: "Unexpected response",
    status: response.status,
    code: "ECP-GEN-5000",
    instance: "",
    errors: [],
  };
}

export function problemMessage(
  problem: ApiProblem,
  fallback = "The request could not be completed. Try again.",
): string {
  return problemMessages[problem.code] ?? fallback;
}

export function fieldErrors(problem: ApiProblem): Record<string, string> {
  return Object.fromEntries(
    problem.errors
      .filter((error) => error.field)
      .map((error) => [
        error.field,
        fieldErrorMessages[error.code] ?? "Check this field.",
      ]),
  );
}
