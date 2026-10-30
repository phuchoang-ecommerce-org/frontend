const catalogWriteRoles = new Set(["STAFF", "ADMINISTRATOR"]);
const inventoryReadRoles = new Set([
  "STAFF",
  "WAREHOUSE_OPERATOR",
  "CUSTOMER_SUPPORT",
  "ADMINISTRATOR",
]);
const inventoryAdjustRoles = new Set(["WAREHOUSE_OPERATOR", "ADMINISTRATOR"]);
const orderManageRoles = new Set(["STAFF", "WAREHOUSE_OPERATOR", "ADMINISTRATOR"]);

function hasRole(roles: readonly string[], permitted: ReadonlySet<string>): boolean {
  return roles.some((role) => permitted.has(role));
}

export function canWriteCatalog(roles: readonly string[]): boolean {
  return hasRole(roles, catalogWriteRoles);
}

export function canReadInventory(roles: readonly string[]): boolean {
  return hasRole(roles, inventoryReadRoles);
}

export function canAdjustInventory(roles: readonly string[]): boolean {
  return hasRole(roles, inventoryAdjustRoles);
}

export function canManageOrders(roles: readonly string[]): boolean {
  return hasRole(roles, orderManageRoles);
}
