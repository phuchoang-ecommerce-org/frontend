import { describe, expect, it } from "vitest";

import { ApiParseError, ApiProblem, ApiTransportError } from "../errors";
import type { Problem } from "../schema";

const problem: Problem = {
  type: "https://ecp.example/errors/ECP-INV-4091",
  title: "Insufficient available stock",
  status: 409,
  code: "ECP-INV-4091",
  instance: "/orders",
  errors: [],
};

describe("ApiProblem", () => {
  it("exposes the RFC 9457 code for branching", () => {
    const error = new ApiProblem(problem);
    expect(error.code).toBe("ECP-INV-4091");
    expect(error.problem).toBe(problem);
  });
});

describe("ApiParseError", () => {
  it("carries the operation and correlation id for diagnosis", () => {
    const error = new ApiParseError("GET /products/{id}", "corr-1", new Error("bad shape"));
    expect(error.operation).toBe("GET /products/{id}");
    expect(error.correlationId).toBe("corr-1");
  });
});

describe("ApiTransportError", () => {
  it("carries the operation and underlying cause", () => {
    const cause = new Error("network down");
    const error = new ApiTransportError("GET /products/{id}", cause);
    expect(error.operation).toBe("GET /products/{id}");
    expect(error.cause).toBe(cause);
  });
});
