/**
 * Client-safe monetary display. Amounts remain decimal strings at every API
 * boundary; this formatter is presentation-only and never performs commerce
 * arithmetic.
 */
export interface Money {
  readonly amount: string;
  readonly currency: string;
}

export function formatMoney(money: Money, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
  }).format(Number(money.amount));
}
