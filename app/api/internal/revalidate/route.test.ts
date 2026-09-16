import { createHmac } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidateTag }));

import { POST } from "./route";

const secret = "sprint-nine-test-secret";

function signedRequest(value: unknown, signatureBody?: string): Request {
  const body = JSON.stringify(value);
  const signed = signatureBody ?? body;
  const signature = createHmac("sha256", secret).update(signed).digest("hex");
  return new Request("http://localhost/api/internal/revalidate", {
    method: "POST",
    headers: { "X-ECP-Signature": `sha256=${signature}` },
    body,
  });
}

function envelope(eventType: string, payload: unknown) {
  return {
    eventId: "018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12",
    eventType,
    eventVersion: 1,
    occurredAt: "2026-09-16T10:00:00.000Z",
    aggregateType: "Product",
    aggregateId: "018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12",
    correlationId: "0f9c2b3a-4d61-4e2f-9c77-1a2b3c4d5e6f",
    payload,
  };
}

describe("POST /api/internal/revalidate", () => {
  beforeEach(() => {
    process.env.ECP_REVALIDATE_SECRET = secret;
    revalidateTag.mockReset();
  });

  it("revalidates the canonical tags for a valid signed catalog event", async () => {
    const response = await POST(
      signedRequest(
        envelope("ProductPublished", {
          productId: "018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12",
          variantSkus: ["TRJ-BLK-M"],
          affectedCategorySlugs: ["outerwear"],
        }),
      ),
    );

    expect(response.status).toBe(204);
    expect(revalidateTag).toHaveBeenCalledTimes(3);
    expect(revalidateTag).toHaveBeenCalledWith(
      "product:018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12",
      "max",
    );
    expect(revalidateTag).toHaveBeenCalledWith(
      "variant-price:TRJ-BLK-M",
      "max",
    );
    expect(revalidateTag).toHaveBeenCalledWith("category:outerwear", "max");
  });

  it("refuses a body whose signature was computed before tampering", async () => {
    const original = envelope("ProductPriceChanged", {
      productId: "018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12",
      variantSkus: ["TRJ-BLK-M"],
    });
    const tampered = { ...original, eventType: "ProductDiscontinued" };

    const response = await POST(
      signedRequest(tampered, JSON.stringify(original)),
    );

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("treats a valid unknown event as a logged no-op", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const response = await POST(signedRequest(envelope("ProductCreated", {})));

    expect(response.status).toBe(204);
    expect(revalidateTag).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      "Ignored unsupported catalog revalidation event",
      expect.objectContaining({ eventType: "ProductCreated" }),
    );
    warn.mockRestore();
  });
});
