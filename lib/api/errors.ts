import "server-only";

import type { Problem } from "./schema";

/** A response body that failed Zod parsing — never silently coerced. */
export class ApiParseError extends Error {
  constructor(
    public readonly operation: string,
    public readonly correlationId: string,
    public readonly cause: unknown,
  ) {
    super(`Failed to parse response for ${operation} (correlationId=${correlationId})`);
    this.name = "ApiParseError";
  }
}

/** A non-2xx response, parsed into the RFC 9457 problem+json taxonomy. */
export class ApiProblem extends Error {
  constructor(public readonly problem: Problem) {
    super(problem.title);
    this.name = "ApiProblem";
  }

  get code(): string {
    return this.problem.code;
  }
}

/** Network failure, timeout, or abort — never reached the server at all. */
export class ApiTransportError extends Error {
  constructor(
    public readonly operation: string,
    public readonly cause: unknown,
  ) {
    super(`Transport failure calling ${operation}`);
    this.name = "ApiTransportError";
  }
}
