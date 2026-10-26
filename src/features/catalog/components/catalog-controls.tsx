"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button, SelectField, StatusMessage, TextField } from "@/components/ui";
import type { Variant } from "../types";

export function VariantPicker({
  variants,
  value,
  disabled,
  onChange,
}: {
  variants: Variant[];
  value: string;
  disabled?: boolean;
  onChange: (variantId: string) => void;
}) {
  return (
    <SelectField
      name="variant"
      label="Variant"
      value={value}
      options={variants.map((variant) => ({
        value: variant.id,
        label: variant.label,
        disabled: !variant.available,
      }))}
      disabled={disabled || !variants.length}
      onChange={onChange}
      hint={!variants.length ? "No variants available." : undefined}
    />
  );
}

export type ProductDraft = {
  name: string;
  sku: string;
  price: string;
  description: string;
};
export function ProductEditor({
  product,
  pending = false,
  errors = {},
  onSubmit,
}: {
  product?: ProductDraft;
  pending?: boolean;
  errors?: Partial<Record<keyof ProductDraft, string>>;
  onSubmit: (draft: ProductDraft) => void | Promise<void>;
}) {
  const [draft, setDraft] = useState<ProductDraft>(
    product ?? { name: "", sku: "", price: "", description: "" },
  );
  const [localError, setLocalError] = useState("");
  const update = (key: keyof ProductDraft) => (value: string) => {
    setLocalError("");
    setDraft((current) => ({ ...current, [key]: value }));
  };
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !draft.name.trim() ||
      !draft.sku.trim() ||
      !Number.isFinite(Number(draft.price)) ||
      Number(draft.price) <= 0
    ) {
      setLocalError("Enter a name, SKU, and positive price.");
      return;
    }
    void onSubmit(draft);
  }
  return (
    <form onSubmit={submit} className="space-y-4" aria-busy={pending}>
      <TextField
        name="name"
        label="Product name"
        value={draft.name}
        required
        error={errors.name}
        onChange={update("name")}
      />
      <TextField
        name="sku"
        label="SKU"
        value={draft.sku}
        required
        error={errors.sku}
        onChange={update("sku")}
      />
      <TextField
        name="price"
        label="Price"
        type="number"
        value={draft.price}
        required
        error={errors.price}
        onChange={update("price")}
      />
      <TextField
        name="description"
        label="Description"
        value={draft.description}
        error={errors.description}
        onChange={update("description")}
      />
      {localError && <StatusMessage kind="error" message={localError} />}
      <Button type="submit" loading={pending}>
        Save product
      </Button>
    </form>
  );
}
