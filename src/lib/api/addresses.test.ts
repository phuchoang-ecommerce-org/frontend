import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const backendRequest = vi.hoisted(() => vi.fn());
vi.mock("./backend", () => ({ backendRequest }));

import { listAddresses } from "./addresses";

const firstAddress = {
  id: "address-1",
  recipientName: "Taylor Customer",
  line1: "1 Main Street",
  city: "Hanoi",
  postalCode: "100000",
  countryCode: "VN",
};

const secondAddress = {
  ...firstAddress,
  id: "address-2",
  line1: "2 Main Street",
};

describe("listAddresses", () => {
  afterEach(() => vi.clearAllMocks());

  it("accepts an empty address book from the live page envelope", async () => {
    backendRequest.mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [], page: { size: 0 } })),
    );

    await expect(listAddresses("access-token")).resolves.toEqual([]);
  });

  it("follows opaque cursors until every address page is read", async () => {
    backendRequest
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [firstAddress],
            page: { size: 100, next: "opaque-next" },
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ items: [secondAddress], page: { size: 100 } }),
        ),
      );

    await expect(listAddresses("access-token")).resolves.toEqual([
      firstAddress,
      secondAddress,
    ]);
    expect(backendRequest).toHaveBeenNthCalledWith(
      1,
      "/accounts/me/addresses?size=100",
      expect.objectContaining({ headers: { Authorization: "Bearer access-token" } }),
    );
    expect(backendRequest).toHaveBeenNthCalledWith(
      2,
      "/accounts/me/addresses?size=100&cursor=opaque-next",
      expect.any(Object),
    );
  });

  it("rejects a repeated cursor instead of looping forever", async () => {
    backendRequest.mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            items: [firstAddress],
            page: { size: 100, next: "repeated-cursor" },
          }),
        ),
      ),
    );

    await expect(listAddresses("access-token")).rejects.toThrow(
      "Address pagination returned a repeated cursor",
    );
  });
});
