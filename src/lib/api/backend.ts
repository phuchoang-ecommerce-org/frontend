import "server-only";

export type ApiProblem = {
  code?: string;
  detail?: string;
  title?: string;
  errors?: { field: string; detail?: string; message?: string }[];
};

export async function backendRequest(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const base = process.env.ECP_API_BASE_URL;
  if (!base) throw new Error("ECP_API_BASE_URL is not configured");
  return fetch(`${base.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
    cache: init.cache ?? "no-store",
  });
}

export async function readProblem(response: Response): Promise<ApiProblem> {
  try {
    return (await response.json()) as ApiProblem;
  } catch {
    return {};
  }
}

export function fieldErrors(problem: ApiProblem): Record<string, string> {
  return Object.fromEntries(
    (problem.errors ?? [])
      .filter((error) => error.field)
      .map((error) => [error.field, error.detail ?? error.message ?? "Check this field."]),
  );
}
