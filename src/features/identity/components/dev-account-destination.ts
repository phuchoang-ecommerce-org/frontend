export function devAccountDestination(accountKey: string): string {
  return accountKey === "customer" ? "/" : "/welcome";
}
