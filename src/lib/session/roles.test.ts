import { describe, expect, it } from "vitest";
import {
  canAdjustInventory,
  canReadInventory,
  canWriteCatalog,
} from "./roles";

describe("staff role grants", () => {
  it("keeps catalog writes limited to Staff and Administrator", () => {
    expect(canWriteCatalog(["STAFF"])).toBe(true);
    expect(canWriteCatalog(["ADMINISTRATOR"])).toBe(true);
    expect(canWriteCatalog(["WAREHOUSE_OPERATOR"])).toBe(false);
    expect(canWriteCatalog(["CUSTOMER"])).toBe(false);
  });

  it("allows operational inventory reads but restricts adjustments", () => {
    expect(canReadInventory(["STAFF"])).toBe(true);
    expect(canReadInventory(["CUSTOMER_SUPPORT"])).toBe(true);
    expect(canReadInventory(["CUSTOMER"])).toBe(false);
    expect(canAdjustInventory(["WAREHOUSE_OPERATOR"])).toBe(true);
    expect(canAdjustInventory(["ADMINISTRATOR"])).toBe(true);
    expect(canAdjustInventory(["STAFF"])).toBe(false);
  });
});
