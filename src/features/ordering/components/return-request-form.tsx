"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button, StatusMessage, TextField } from "@/components/ui";
import type { OrderLine, ReturnRequest } from "../types";

export function ReturnRequestForm({
  orderLines,
  pending = false,
  errors = {},
  onSubmit,
}: {
  orderLines: OrderLine[];
  pending?: boolean;
  errors?: { lines?: string; reason?: string };
  onSubmit: (request: ReturnRequest) => void | Promise<void>;
}) {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("");
  const [localError, setLocalError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const lines = Object.entries(selected)
      .filter(([, quantity]) => quantity > 0)
      .map(([lineId, quantity]) => ({ lineId, quantity }));
    if (
      !lines.length ||
      !reason.trim() ||
      lines.some(
        (line) =>
          !Number.isSafeInteger(line.quantity) ||
          line.quantity >
            (orderLines.find((item) => item.id === line.lineId)?.quantity ?? 0),
      )
    ) {
      setLocalError("Select a valid item quantity and give a reason.");
      return;
    }
    setLocalError("");
    void onSubmit({ lines, reason: reason.trim() });
  }
  return (
    <form onSubmit={submit} className="space-y-4" aria-busy={pending}>
      <fieldset className="space-y-2">
        <legend className="font-semibold">Items to return</legend>
        {orderLines
          .filter((line) => line.returnable)
          .map((line) => (
            <label
              key={line.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-control border border-border p-3"
            >
              <span>
                {line.name} (up to {line.quantity})
              </span>
              <input
                type="number"
                min={0}
                max={line.quantity}
                step={1}
                value={selected[line.id] ?? 0}
                onChange={(event) =>
                  setSelected((current) => ({
                    ...current,
                    [line.id]: Number(event.target.value),
                  }))
                }
                className="min-h-control w-20 rounded-control border border-input px-2 text-base"
                aria-label={`Quantity to return: ${line.name}`}
              />
            </label>
          ))}
        {!orderLines.some((line) => line.returnable) && (
          <p className="text-sm text-muted-foreground">
            No items are eligible for return.
          </p>
        )}
      </fieldset>
      {errors.lines && <StatusMessage kind="error" message={errors.lines} />}
      <TextField
        name="reason"
        label="Return reason"
        value={reason}
        required
        error={errors.reason}
        onChange={setReason}
      />
      {localError && <StatusMessage kind="error" message={localError} />}
      <Button
        type="submit"
        loading={pending}
        disabled={!orderLines.some((line) => line.returnable)}
      >
        Request return
      </Button>
    </form>
  );
}
