"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CsrfField } from "@/components/ui/csrf-field";
import { FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  addAdminVariant,
  changeAdminVariantPrice,
  removeAdminVariant,
  type AdminActionResult,
} from "@/features/administration/server/actions";
import type { AdminVariant } from "@/features/administration/schema/catalog";

import {
  initialProductActionState,
  ProductActionResult,
} from "./product-action-state";

export function VariantManager({
  productId,
  variants,
}: {
  productId: string;
  variants: AdminVariant[];
}) {
  const router = useRouter();
  const [addState, addAction, addPending] = useActionState(
    async (_previous: AdminActionResult, formData: FormData) => {
      const result = await addAdminVariant(productId, {
        csrfToken: formData.get("csrfToken"),
        sku: formData.get("sku"),
        name: formData.get("name") || undefined,
        listPrice: {
          amount: formData.get("amount"),
          currency: formData.get("currency"),
        },
        active: formData.get("active") === "on",
      });
      if (result.ok) router.refresh();
      return result;
    },
    initialProductActionState,
  );
  return (
    <section className="p-5 rounded-card border border-border bg-surface">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-primary">Variants</h2>
          <p className="text-sm text-neutral-700">
            Prices are amended and audited separately.
          </p>
        </div>
        <span className="text-sm text-neutral-700">
          {variants.length} variants
        </span>
      </div>
      <div className="mt-4 divide-y divide-border">
        {variants.map((variant) => (
          <VariantRow key={variant.id} productId={productId} variant={variant} />
        ))}
      </div>
      <form
        action={addAction}
        className="mt-4 grid gap-3 border-t border-border pt-4 md:grid-cols-2"
      >
        <CsrfField />
        <label className="flex flex-col gap-1 text-sm font-medium text-primary">
          SKU
          <Input name="sku" required />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-primary">
          Name
          <Input name="name" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-primary">
          Price amount
          <Input name="amount" inputMode="decimal" required />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-primary">
          Currency
          <Input name="currency" defaultValue="VND" maxLength={3} required />
        </label>
        <label className="flex items-center gap-2 text-sm text-primary">
          <input
            name="active"
            type="checkbox"
            defaultChecked
            className="size-5 accent-primary"
          />{" "}
          Active
        </label>
        <div className="flex items-end justify-end">
          <Button type="submit" disabled={addPending}>
            {addPending ? "Adding…" : "Add variant"}
          </Button>
        </div>
        <ProductActionResult state={addState} />
      </form>
    </section>
  );
}

function VariantRow({
  productId,
  variant,
}: {
  productId: string;
  variant: AdminVariant;
}) {
  const router = useRouter();
  const [priceState, priceAction, pricePending] = useActionState(
    async (_previous: AdminActionResult, formData: FormData) => {
      const result = await changeAdminVariantPrice(productId, variant.id, {
        csrfToken: formData.get("csrfToken"),
        listPrice: {
          amount: formData.get("amount"),
          currency: formData.get("currency"),
        },
        reason: formData.get("reason"),
      });
      if (result.ok) router.refresh();
      return result;
    },
    initialProductActionState,
  );
  const [removeState, removeAction, removePending] = useActionState(
    async (_previous: AdminActionResult, formData: FormData) => {
      const result = await removeAdminVariant(productId, variant.id, {
        csrfToken: formData.get("csrfToken"),
      });
      if (result.ok) router.refresh();
      return result;
    },
    initialProductActionState,
  );
  return (
    <div className="grid gap-3 py-4 lg:grid-cols-2">
      <div>
        <p className="font-medium text-primary">{variant.sku}</p>
        <p className="text-sm text-neutral-700">
          {variant.name ?? "Unnamed variant"} · {variant.active ? "Active" : "Inactive"}
        </p>
        <form action={priceAction} className="mt-3 flex flex-wrap items-end gap-2">
          <CsrfField />
          <label className="flex flex-col gap-1 text-xs font-medium text-neutral-700">
            Amount
            <Input name="amount" defaultValue={variant.listPrice.amount} inputMode="decimal" required />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-neutral-700">
            Currency
            <Input name="currency" defaultValue={variant.listPrice.currency} maxLength={3} required />
          </label>
          <label className="min-w-44 flex flex-1 flex-col gap-1 text-xs font-medium text-neutral-700">
            Audit reason
            <Input name="reason" required />
          </label>
          <Button type="submit" variant="outline" disabled={pricePending}>
            {pricePending ? "Saving…" : "Change price"}
          </Button>
          {priceState.formError ? <FormMessage className="w-full">{priceState.formError}</FormMessage> : null}
        </form>
      </div>
      <form action={removeAction} className="flex items-start">
        <CsrfField />
        <Button type="submit" variant="ghost" size="icon" disabled={removePending} aria-label={`Remove ${variant.sku}`}>
          <Trash2 aria-hidden="true" className="size-icon" />
        </Button>
        {removeState.conflict === "removal-blocked" ? (
          <span className="sr-only">
            This variant cannot be removed while stock or open orders reference it.
          </span>
        ) : null}
      </form>
    </div>
  );
}
