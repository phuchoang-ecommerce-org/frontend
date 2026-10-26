export type Money = { amount: string | number; currency: string } | null;

export function formatMoney(money: Money): string {
  if (!money) return "Price unavailable";
  const amount = Number(money.amount);
  if (!Number.isFinite(amount)) return `${money.amount} ${money.currency}`;
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: money.currency,
    }).format(amount);
  } catch {
    return `${money.amount} ${money.currency}`;
  }
}
