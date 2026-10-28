import { createHmac } from "node:crypto";

import { afterEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({ revalidateTag }));

import { POST } from "./route";

const secret = "test-revalidation-secret";
const productId = "aa85d5d6-15b4-42b9-8ef6-7057f1ed7ad4";
const categoryId = "0b24af98-cc55-4d55-90da-c42e5d12f4c7";

function envelope(overrides: Record<string, unknown> = {}) {
  return {
    eventId: "3982df18-bde0-48b2-a3f8-49ee08001f1b",
    eventType: "ProductPublished",
    eventVersion: 1,
    occurredAt: "2026-10-28T06:30:00.000Z",
    aggregateType: "Product",
    aggregateId: productId,
    correlationId: "97cc4c91-1930-4e12-a004-3bf99608d4a7",
    payload: {
      productId,
      variantSkus: ["SKU-001"],
      affectedCategorySlugs: ["electronics"],
      affectedCategoryIds: [categoryId],
    },
    ...overrides,
  };
}

function signedRequest(body: unknown, signature = true): Request {
  const rawBody = JSON.stringify(body);
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  return new Request("http://localhost/api/internal/revalidate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-ECP-Signature": signature ? `sha256=${digest}` : "sha256=".padEnd(71, "0"),
    },
    body: rawBody,
  });
}

describe("POST /api/internal/revalidate", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    revalidateTag.mockReset();
  });

  it("authenticates raw bytes and expires the frontend tags for a published product", async () => {
    vi.stubEnv("ECP_REVALIDATE_SECRET", secret);

    await expect(POST(signedRequest(envelope()))).resolves.toMatchObject({
      status: 204,
    });

    expect(revalidateTag).toHaveBeenCalledTimes(7);
    expect(revalidateTag).toHaveBeenCalledWith("catalog", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("products", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith(`product:${productId}`, {
      expire: 0,
    });
    expect(revalidateTag).toHaveBeenCalledWith("variant-price:SKU-001", {
      expire: 0,
    });
    expect(revalidateTag).toHaveBeenCalledWith("categories", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("category:electronics", {
      expire: 0,
    });
    expect(revalidateTag).toHaveBeenCalledWith(`category:${categoryId}`, {
      expire: 0,
    });
  });

  it("rejects a forged signature without parsing or invalidating", async () => {
    vi.stubEnv("ECP_REVALIDATE_SECRET", secret);
    const parse = vi.spyOn(JSON, "parse");

    await expect(POST(signedRequest(envelope(), false))).resolves.toMatchObject({
      status: 401,
    });

    expect(parse).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("fails closed when the shared callback secret is not configured", async () => {
    await expect(POST(signedRequest(envelope()))).resolves.toMatchObject({
      status: 401,
    });

    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("returns 400 for an authenticated event that misses its v1 payload schema", async () => {
    vi.stubEnv("ECP_REVALIDATE_SECRET", secret);

    await expect(
      POST(signedRequest(envelope({ payload: { productId } }))),
    ).resolves.toMatchObject({ status: 400 });

    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("treats repeated valid delivery as a safe 204 replay", async () => {
    vi.stubEnv("ECP_REVALIDATE_SECRET", secret);
    const requestBody = envelope({
      eventType: "ProductPriceChanged",
      payload: { productId, variantSkus: ["SKU-001"] },
    });

    await expect(POST(signedRequest(requestBody))).resolves.toMatchObject({
      status: 204,
    });
    await expect(POST(signedRequest(requestBody))).resolves.toMatchObject({
      status: 204,
    });

    expect(revalidateTag).toHaveBeenCalledTimes(8);
  });

  it("invalidates the backend's existing ProductUpdated callback payload", async () => {
    vi.stubEnv("ECP_REVALIDATE_SECRET", secret);

    await expect(
      POST(signedRequest(envelope({ eventType: "ProductUpdated" }))),
    ).resolves.toMatchObject({ status: 204 });

    expect(revalidateTag).toHaveBeenCalledWith(`product:${productId}`, {
      expire: 0,
    });
    expect(revalidateTag).toHaveBeenCalledWith(`category:${categoryId}`, {
      expire: 0,
    });
  });

  it("invalidates a backend category-removal payload", async () => {
    vi.stubEnv("ECP_REVALIDATE_SECRET", secret);

    await expect(
      POST(
        signedRequest(
          envelope({
            eventType: "CategoryChanged",
            aggregateType: "Category",
            aggregateId: categoryId,
            payload: {
              id: categoryId,
              affectedCategorySlugs: ["electronics"],
              affectedCategoryIds: [categoryId],
            },
          }),
        ),
      ),
    ).resolves.toMatchObject({ status: 204 });

    expect(revalidateTag).toHaveBeenCalledWith("categories", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith(`category:${categoryId}`, {
      expire: 0,
    });
  });

  it("acknowledges a valid unsupported event without invalidating", async () => {
    vi.stubEnv("ECP_REVALIDATE_SECRET", secret);

    await expect(
      POST(signedRequest(envelope({ eventType: "ProductCreated" }))),
    ).resolves.toMatchObject({ status: 204 });

    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
