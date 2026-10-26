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
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [localError, setLocalError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !orderId ||
      !carrier ||
      (carrier === "manual" && !manualReason.trim())
    ) {
      setLocalError("Select a carrier and explain a manual shipment.");
      return;
    }
    setLocalError("");
    void onSubmit({ orderId, carrier, trackingNumber, manualReason });
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
        required
        error={errors.carrier}
        onChange={setCarrier}
      />
      <TextField
        name="trackingNumber"
        label="Tracking number"
        value={trackingNumber}
        error={errors.trackingNumber}
        onChange={setTrackingNumber}
      />
      {carrier === "manual" && (
        <TextField
          name="manualReason"
          label="Manual shipment reason"
          value={manualReason}
          required
          error={errors.manualReason}
          onChange={setManualReason}
        />
      )}
      {localError && <StatusMessage kind="error" message={localError} />}
      <Button type="submit" loading={pending}>
        Create shipment
      </Button>
    </form>
  );
}
