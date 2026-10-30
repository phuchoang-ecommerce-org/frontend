"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button, SelectField, StatusMessage, TextField } from "@/components/ui";
import type { ShipmentRequest } from "../types";

export function ShipmentForm({
  orderId,
  carriers,
  pending = false,
  errors = {},
  onSubmit,
}: {
  orderId: string;
  carriers: { value: string; label: string }[];
  pending?: boolean;
  errors?: Partial<Record<keyof ShipmentRequest, string>>;
  onSubmit: (request: ShipmentRequest) => void | Promise<void>;
}) {
  const [carrier, setCarrier] = useState("automatic");
  const [carrierOverrideReason, setCarrierOverrideReason] = useState("");
  const [lineIds, setLineIds] = useState("");
  const [localError, setLocalError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !orderId ||
      (carrier !== "automatic" && !carrierOverrideReason.trim())
    ) {
      setLocalError("Explain why a carrier override is required.");
      return;
    }
    setLocalError("");
    void onSubmit({
      orderId,
      ...(carrier !== "automatic"
        ? { carrier, carrierOverrideReason: carrierOverrideReason.trim() }
        : {}),
      ...(lineIds.trim()
        ? { lineIds: lineIds.split(",").map((id) => id.trim()).filter(Boolean) }
        : {}),
    });
  }
  return (
    <form onSubmit={submit} className="space-y-4" aria-busy={pending}>
      <p className="text-sm">
        Order <strong>{orderId}</strong>
      </p>
      <SelectField
        name="carrier"
        label="Carrier"
        value={carrier}
        options={carriers}
        error={errors.carrier}
        onChange={setCarrier}
      />
      {carrier !== "automatic" && (
        <TextField
          name="carrierOverrideReason"
          label="Carrier override reason"
          value={carrierOverrideReason}
          required
          error={errors.carrierOverrideReason}
          onChange={setCarrierOverrideReason}
        />
      )}
      <TextField
        name="lineIds"
        label="Order line IDs (optional)"
        hint="Separate IDs with commas to create one shipment for those lines."
        value={lineIds}
        error={errors.lineIds}
        onChange={setLineIds}
      />
      <p className="text-sm text-muted">The carrier issues the tracking reference after this request succeeds.</p>
      {localError && <StatusMessage kind="error" message={localError} />}
      <Button type="submit" loading={pending}>
        Create shipment
      </Button>
    </form>
  );
}
