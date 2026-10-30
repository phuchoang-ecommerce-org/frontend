import "server-only";

export const devAccounts = [
  { key: "customer", email: "customer@demo.local", role: "Customer" },
  { key: "staff", email: "staff@demo.local", role: "Staff" },
  {
    key: "warehouse",
    email: "warehouse@demo.local",
    role: "Warehouse operator",
  },
  { key: "support", email: "support@demo.local", role: "Customer support" },
  { key: "admin", email: "admin@demo.local", role: "Administrator" },
] as const;

export function devLoginEnabled(): boolean {
  if (
    process.env.ECP_FRONTEND_PROFILE !== "dev" ||
    process.env.ECP_DEMO_LOGIN_ENABLED !== "true" ||
    !process.env.ECP_DEMO_PASSWORD
  )
    return false;
  try {
    const url = new URL(process.env.ECP_API_BASE_URL ?? "");
    return (
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "::1"].includes(url.hostname)
    );
  } catch {
    return false;
  }
}
