"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button, SelectField, StatusMessage, TextField } from "@/components/ui";
import type { StockAdjustment } from "../types";

export function StockAdjustmentForm({
  stockItemId,
  sku,
  warehouseId,
  reasonCodes,
  pending = false,
  errors = {},
  onSubmit,
}: {
  stockItemId: string;
  sku: string;
  warehouseId: string;
  reasonCodes: { value: string; label: string }[];
  pending?: boolean;
  errors?: Partial<Record<keyof StockAdjustment, string>>;
  onSubmit: (change: StockAdjustment) => void | Promise<void>;
}) {
  const [delta, setDelta] = useState("");
  const [reasonCode, setReasonCode] = useState("");
  const [reason, setReason] = useState("");
  const [localError, setLocalError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(delta);
    if (
      !Number.isSafeInteger(amount) ||
      amount === 0 ||
      !reasonCode ||
      !reason.trim()
    ) {
      setLocalError(
        "Enter a non-zero whole number, reason code, and explanation.",
      );
      return;
    }
    setLocalError("");
    void onSubmit({ delta: amount, reasonCode, reason: reason.trim() });
  }
  return (
    <form onSubmit={submit} className="space-y-4" aria-busy={pending}>
      <p className="text-sm">
        Adjusting <strong>{sku}</strong> at warehouse{" "}
        <strong>{warehouseId}</strong>
      </p>
      <input type="hidden" name="stockItemId" value={stockItemId} />
      <TextField
        name="delta"
        label="Change in units"
        type="number"
        value={delta}
        required
        hint="Use a negative number to reduce stock."
        error={errors.delta}
        onChange={setDelta}
      />
      <SelectField
        name="reasonCode"
        label="Reason code"
        value={reasonCode}
        options={reasonCodes}
        required
        error={errors.reasonCode}
        onChange={setReasonCode}
      />
      <TextField
        name="reason"
        label="Explanation"
        value={reason}
        required
        error={errors.reason}
        onChange={setReason}
      />
      {localError && <StatusMessage kind="error" message={localError} />}
      <Button type="submit" loading={pending}>
        Record adjustment
      </Button>
    </form>
  );
}
