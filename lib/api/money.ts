import "server-only";

import { z } from "zod";

/**
 * A monetary value. `amount` is a decimal string, never a number — so no
 * client's JSON parser can silently turn it into a binary float
 * (Integration Contract §2, common.yaml#Money). Format only; never compute.
 * See eslint.config.mjs's `no-restricted-syntax` ban on `Number(x.amount)` /
 * `parseFloat(x.amount)` / `parseInt(x.amount)` / `+x.amount`.
 */
export interface Money {
  readonly amount: string;
  readonly currency: string;
}

export const MoneySchema = z
  .object({
    amount: z.string().regex(/^-?[0-9]{1,15}(\.[0-9]{1,4})?$/),
    currency: z.string().regex(/^[A-Z]{3}$/),
  })
  .strict();

export function formatMoney(money: Money, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
  }).format(Number(money.amount));
}
