import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { fieldErrors, problemMessage, readProblem } from "./backend";

describe("API problem mapping", () => {
  it("maps a stable problem code to shopper-safe copy", async () => {
    const problem = await readProblem(
      new Response(
        JSON.stringify({
          type: "https://ecp.example/errors/ECP-CRT-4090",
          title: "Requested quantity exceeds available stock",
          status: 409,
          code: "ECP-CRT-4090",
          detail: "Internal inventory detail that must not reach the shopper.",
          instance: "/api/v1/carts/cart-id/lines",
          correlationId: "correlation-id",
          errors: [],
        }),
        { status: 409 },
      ),
    );

    expect(problemMessage(problem)).toBe(
      "Stock changed. Choose a lower quantity and try again.",
    );
  });

  it("maps field sub-codes without exposing developer detail", async () => {
    const problem = await readProblem(
      new Response(
        JSON.stringify({
          type: "https://ecp.example/errors/ECP-GEN-4000",
          title: "Validation failed",
          status: 400,
          code: "ECP-GEN-4000",
          instance: "/api/v1/accounts",
          errors: [
            {
              field: "email",
              code: "ECP-GEN-4002",
              detail: "Developer-only validation detail.",
            },
          ],
        }),
        { status: 400 },
      ),
    );

    expect(fieldErrors(problem)).toEqual({ email: "This field is required." });
  });

  it("normalizes a malformed problem response", async () => {
    const problem = await readProblem(
      new Response("not-json", { status: 503 }),
    );

    expect(problem.code).toBe("ECP-GEN-5000");
    expect(problem.status).toBe(503);
  });
});
