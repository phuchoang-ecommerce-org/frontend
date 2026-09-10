import { z } from "zod";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiQuery } from "../client";
import { ApiParseError, ApiProblem } from "../errors";

const ItemSchema = z.object({ id: z.string(), name: z.string() });

describe("apiQuery", () => {
  beforeEach(() => {
    process.env.ECP_API_BASE_URL = "http://localhost:8080/api/v1";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.ECP_API_BASE_URL;
  });

  it("joins the base URL's own path with the relative endpoint path", async () => {
    const fetchMock = vi.fn<(url: URL, init?: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(
        new Response(JSON.stringify({ id: "1", name: "Widget" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiQuery(
      { path: "/products/{productId}", pathParams: { productId: "1" }, cache: "no-store" },
      ItemSchema,
    );

    expect(result).toEqual({ id: "1", name: "Widget" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl] = fetchMock.mock.calls[0] ?? [];
    expect(String(calledUrl)).toBe("http://localhost:8080/api/v1/products/1");
  });

  it("throws ApiProblem on a non-2xx problem+json response", async () => {
    const problemBody = {
      type: "https://ecp.example/errors/ECP-INV-4091",
      title: "Insufficient available stock",
      status: 409,
      code: "ECP-INV-4091",
      instance: "/orders",
      errors: [],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify(problemBody), {
            status: 409,
            headers: { "content-type": "application/problem+json" },
          }),
        ),
      ),
    );

    await expect(
      apiQuery({ path: "/products/{id}", pathParams: { id: "1" }, cache: "no-store" }, ItemSchema),
    ).rejects.toBeInstanceOf(ApiProblem);
  });

  it("throws ApiParseError when the 2xx body doesn't match the schema", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ unexpected: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
        ),
      ),
    );

    await expect(
      apiQuery({ path: "/products/{id}", pathParams: { id: "1" }, cache: "no-store" }, ItemSchema),
    ).rejects.toBeInstanceOf(ApiParseError);
  });
});
