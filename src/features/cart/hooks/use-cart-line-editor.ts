"use client";

import { useState } from "react";
import type { CartChangeResult } from "../types";

export function useCartLineEditor(
  quantity: number,
  onQuantityChange: (quantity: number) => Promise<CartChangeResult>,
) {
  const [edit, setEdit] = useState({
    quantity,
    draft: String(quantity),
    error: "",
  });
  const [pending, setPending] = useState(false);
  const draft = edit.quantity === quantity ? edit.draft : String(quantity);
  const error = edit.quantity === quantity ? edit.error : "";
  const setDraft = (value: string) =>
    setEdit({ quantity, draft: value, error: "" });
  const setError = (value: string) =>
    setEdit((current) => ({
      quantity,
      draft: current.quantity === quantity ? current.draft : String(quantity),
      error: value,
    }));
  async function commit() {
    const next = Number(draft);
    if (!Number.isSafeInteger(next) || next < 0) {
      setEdit({
        quantity,
        draft: String(quantity),
        error: "Enter a whole number of zero or more.",
      });
      return;
    }
    if (next === quantity) return;
    setPending(true);
    setError("");
    try {
      const result = await onQuantityChange(next);
      if (!result.ok)
        setEdit({ quantity, draft: String(quantity), error: result.error });
    } catch {
      setEdit({
        quantity,
        draft: String(quantity),
        error: "Quantity could not be updated. Try again.",
      });
    } finally {
      setPending(false);
    }
  }
  return { draft, setDraft, pending, error, commit };
}
