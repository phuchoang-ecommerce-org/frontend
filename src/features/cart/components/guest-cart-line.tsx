"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusMessage } from "@/components/ui";
import type { CartChangeResult, CartLineData } from "../types";
import { CartLine } from "./cart";

export function GuestCartLine({
  line,
  onQuantityChange,
  onRemove,
}: {
  line: CartLineData;
  onQuantityChange: (quantity: number) => Promise<CartChangeResult>;
  onRemove: () => Promise<CartChangeResult>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function update(quantity: number) {
    const result = await onQuantityChange(quantity);
    if (result.ok) router.refresh();
    return result;
  }
  async function remove() {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const result = await onRemove();
      if (result.ok) router.refresh();
      else setError(result.error);
    } catch {
      setError("The item could not be removed. Try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div>
      <CartLine
        line={line}
        pending={pending}
        onQuantityChange={update}
        onRemove={remove}
      />
      {error && <StatusMessage kind="error" message={error} />}
    </div>
  );
}
