import "server-only";

import { z } from "zod";

import { formatMoney, type Money } from "@/lib/utils/money";

/**
 * A monetary value. `amount` is a decimal string, never a number — so no
 * client's JSON parser can silently turn it into a binary float
 * (Integration Contract §2, common.yaml#Money). Format only; never compute.
 * See eslint.config.mjs's `no-restricted-syntax` ban on `Number(x.amount)` /
 * `parseFloat(x.amount)` / `parseInt(x.amount)` / `+x.amount`.
 */
export const MoneySchema = z
  .object({
    amount: z.string().regex(/^-?[0-9]{1,15}(\.[0-9]{1,4})?$/),
    currency: z.string().regex(/^[A-Z]{3}$/),
  })
  .strict();

export { formatMoney, type Money };
