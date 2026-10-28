"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, StatusMessage } from "@/components/ui";
import { focusRing } from "@/components/ui/styles";
import { useCartLineEditor } from "../hooks/use-cart-line-editor";
import type {
  CartChangeResult,
  CartLineData,
  WishlistItemData,
} from "../types";

export function CartLine({
  line,
  pending = false,
  error,
  onQuantityChange,
  onRemove,
}: {
  line: CartLineData;
  pending?: boolean;
  error?: string;
  onQuantityChange: (quantity: number) => Promise<CartChangeResult>;
  onRemove: () => void | Promise<void>;
}) {
  const editor = useCartLineEditor(line.quantity, onQuantityChange);
  const busy = pending || editor.pending;
  return (
    <article className="space-y-3 border-b border-border py-4" aria-busy={busy}>
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <Link
            href={line.href}
            className={`font-medium underline-offset-2 hover:underline ${focusRing}`}
          >
            {line.productName}
          </Link>
          {line.variantLabel && (
            <p className="text-sm text-muted-foreground">{line.variantLabel}</p>
          )}
          <p className="text-sm tabular-nums">{line.unitPrice} each</p>
        </div>
        <strong className="tabular-nums">{line.lineTotal}</strong>
      </div>
      {line.notice && (
        <StatusMessage
          kind={line.available ? "info" : "error"}
          message={line.notice}
        />
      )}
      {line.priceChanged && (
        <StatusMessage
          kind="info"
          message="The current price changed since this item was added. Review the updated total before checkout."
        />
      )}
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-sm font-medium">
          Quantity
          <input
            type="number"
            min={0}
            step={1}
            value={editor.draft}
            disabled={busy || !line.available}
            onChange={(event) => editor.setDraft(event.target.value)}
            className="mt-1 block min-h-control w-24 rounded-control border border-input bg-background px-3 text-base focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
        <Button
          variant="secondary"
          disabled={busy || !line.available}
          onClick={() => void editor.commit()}
        >
          Update
        </Button>
        <Button variant="quiet" disabled={busy} onClick={() => void onRemove()}>
          Remove
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Set quantity to 0 to remove this item.</p>
      {(error || editor.error) && (
        <StatusMessage kind="error" message={error || editor.error} />
      )}
    </article>
  );
}

export function WishlistItem({
  item,
  pending = false,
  error,
  onMoveToCart,
  onRemove,
}: {
  item: WishlistItemData;
  pending?: boolean;
  error?: string;
  onMoveToCart: () => void | Promise<void>;
  onRemove: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");
  async function run(action: () => void | Promise<void>) {
    setBusy(true);
    setLocalError("");
    try {
      await action();
    } catch {
      setLocalError("The item could not be updated. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4">
      <div>
        <Link
          href={item.href}
          className={`font-medium hover:underline ${focusRing}`}
        >
          {item.name}
        </Link>
        <p className="text-sm tabular-nums">
          {item.price} · {item.available ? "Available" : "Out of stock"}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={!item.available || pending || busy}
          loading={busy}
          onClick={() => void run(onMoveToCart)}
        >
          Move to cart
        </Button>
        <Button
          variant="quiet"
          disabled={pending || busy}
          onClick={() => void run(onRemove)}
        >
          Remove
        </Button>
      </div>
      {(error || localError) && (
        <StatusMessage kind="error" message={error || localError} />
      )}
    </article>
  );
}
