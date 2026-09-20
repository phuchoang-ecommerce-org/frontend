"use client";

import { FormMessage } from "@/components/ui/form";
import type { AdminActionResult } from "@/features/administration/server/actions";

export const initialProductActionState: AdminActionResult = { ok: false };

export function ProductActionResult({
  state,
}: {
  state: AdminActionResult;
}) {
  if (state.conflict === "duplicate-sku")
    return (
      <FormMessage>
        That SKU is already in use or has been retired. Use a different SKU.
      </FormMessage>
    );
  if (state.conflict === "removal-blocked")
    return (
      <FormMessage>
        This record has stock or open orders. Unpublish the product instead.
      </FormMessage>
    );
  return state.formError ? <FormMessage>{state.formError}</FormMessage> : null;
}
