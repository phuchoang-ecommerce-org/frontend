import { describe, expect, it } from "vitest";

import { CustomerAddressSchema, CustomerAddressWriteSchema } from "./address";

const validWrite = {
  recipientName: "Jane Doe",
  line1: "1 Main St",
  city: "Hanoi",
  postalCode: "100000",
  countryCode: "VN",
};

describe("CustomerAddressWriteSchema", () => {
  it("accepts a valid write", () => {
    expect(CustomerAddressWriteSchema.safeParse(validWrite).success).toBe(true);
  });

  it("rejects a missing required field", () => {
    const rest: Record<string, unknown> = { ...validWrite };
    delete rest.recipientName;
    expect(CustomerAddressWriteSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects a countryCode that isn't ISO 3166-1 alpha-2", () => {
    expect(
      CustomerAddressWriteSchema.safeParse({ ...validWrite, countryCode: "VNM" }).success,
    ).toBe(false);
  });
});

describe("CustomerAddressSchema", () => {
  it("accepts a read shape with id and default flags", () => {
    const result = CustomerAddressSchema.safeParse({
      ...validWrite,
      id: "addr_1",
      isDefaultShipping: true,
    });
    expect(result.success).toBe(true);
  });

  it("tolerates an additive field it doesn't yet know about", () => {
    const result = CustomerAddressSchema.safeParse({
      ...validWrite,
      id: "addr_1",
      someFutureField: "value",
    });
    expect(result.success).toBe(true);
  });
});
