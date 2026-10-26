"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, StatusMessage } from "@/components/ui";
import type { ProductVariant } from "../types";
import { VariantPicker } from "./catalog-controls";

type AddResult = { ok: true } | { ok: false; error: string };

export function AddToCartForm({
  variants,
  onAdd,
}: {
  variants: ProductVariant[];
  onAdd: (variantId: string, quantity: number) => Promise<AddResult>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedVariant = searchParams.get("variant");
  const [selectedId, setSelectedId] = useState(
    variants.find(
      (variant) => variant.id === requestedVariant && variant.available,
    )?.id ??
      variants.find((variant) => variant.available)?.id ??
      "",
  );
  const [quantity, setQuantity] = useState("1");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const selected = variants.find((variant) => variant.id === selectedId);

  async function add() {
    if (pending) return;
    const count = Number(quantity);
    if (!selected?.available || !Number.isSafeInteger(count) || count < 1) {
      setMessage({
        kind: "error",
        text: "Choose an available variant and a whole quantity greater than zero.",
      });
      return;
    }
    setPending(true);
    setMessage(null);
    try {
      const result = await onAdd(selected.id, count);
      setMessage(
        result.ok
          ? {
              kind: "success",
              text: "Added to cart. Open your cart to review the current price and availability.",
            }
          : { kind: "error", text: result.error },
      );
      if (result.ok) router.refresh();
    } catch {
      setMessage({
        kind: "error",
        text: "The item could not be added. Try again.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4" aria-busy={pending}>
      <VariantPicker
        variants={variants}
        value={selectedId}
        disabled={pending}
        onChange={(id) => {
          setSelectedId(id);
          setMessage(null);
          const next = new URLSearchParams(searchParams.toString());
          next.set("variant", id);
          router.replace(`${pathname}?${next.toString()}`, { scroll: false });
        }}
      />
      {selected && (
        <p className="flex flex-wrap items-baseline gap-2 text-sm">
          <strong className="text-lg tabular-nums">{selected.price}</strong>
          {selected.compareAtPrice && (
            <del className="text-muted-foreground tabular-nums">
              {selected.compareAtPrice}
            </del>
          )}
          <span className="ms-2 text-muted-foreground">
            {selected.availability === "unknown"
              ? "Availability unknown"
              : selected.available
                ? "Available"
                : "Out of stock"}
          </span>
        </p>
      )}
      <label className="block w-32 text-sm font-medium">
        Quantity
        <input
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          value={quantity}
          disabled={pending || !selected?.available}
          onChange={(event) => {
            setQuantity(event.target.value);
            setMessage(null);
          }}
          className="mt-1 min-h-control w-full rounded-control border border-input bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-ring"
        />
      </label>
      <Button
        disabled={!selected?.available}
        loading={pending}
        onClick={() => void add()}
      >
        Add to cart
      </Button>
      {message && <StatusMessage kind={message.kind} message={message.text} />}
    </div>
  );
}
