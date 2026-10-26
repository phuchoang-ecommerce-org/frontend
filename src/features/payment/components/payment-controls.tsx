"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Button, StatusMessage, TextField } from "@/components/ui";
import { usePaymentStatusRefresh } from "../hooks/use-payment-status-refresh";
import type { PaymentMethod, PaymentState, RefundRequest } from "../types";

export function PaymentMethodPicker({
  methods,
  selectedType,
  onSelect,
}: {
  methods: PaymentMethod[];
  selectedType?: string;
  onSelect: (methodType: string) => void;
}) {
  const name = useId();
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 font-semibold">Payment method</legend>
      {methods.map((method) => (
        <label
          key={method.type}
          className="flex cursor-pointer gap-3 rounded-card border border-border p-3 has-checked:border-primary"
        >
          <input
            type="radio"
            name={name}
            checked={selectedType === method.type}
            disabled={!method.available}
            onChange={() => onSelect(method.type)}
            className="accent-primary"
          />
          <span>
            <strong>{method.label}</strong>
            {method.description && (
              <span className="block text-sm text-muted-foreground">
                {method.description}
              </span>
            )}
            {!method.available && (
              <span className="block text-sm text-muted-foreground">
                Unavailable
              </span>
            )}
          </span>
        </label>
      ))}
      {!methods.length && (
        <p className="text-sm text-muted-foreground">
          No payment methods are available.
        </p>
      )}
    </fieldset>
  );
}

export function PaymentProcessingStatus({
  state,
  orderHref,
}: {
  state: PaymentState;
  orderHref: string;
}) {
  usePaymentStatusRefresh(state === "pending");
  return (
    <div role="status" className="space-y-2">
      <p>
        {state === "pending"
          ? "Checking your payment result…"
          : state === "paid"
            ? "Payment confirmed."
            : state === "failed"
              ? "Payment failed."
              : state === "refunded"
                ? "Payment refunded."
                : "Cash is due on delivery."}
      </p>
      <Link
        href={orderHref}
        className="text-sm font-medium underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        View order
      </Link>
    </div>
  );
}

export function RetryPaymentButton({
  canRetry,
  pending = false,
  onRetry,
}: {
  canRetry: boolean;
  pending?: boolean;
  onRetry: () => void | Promise<void>;
}) {
  return (
    <Button
      disabled={!canRetry}
      loading={pending}
      onClick={() => void onRetry()}
    >
      Retry payment
    </Button>
  );
}

export function RefundForm({
  maxRefundableAmount,
  pending = false,
  errors = {},
  onSubmit,
}: {
  maxRefundableAmount: string;
  pending?: boolean;
  errors?: Partial<Record<keyof RefundRequest, string>>;
  onSubmit: (request: RefundRequest) => void | Promise<void>;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [localError, setLocalError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !/^\d+(\.\d{1,2})?$/.test(amount) ||
      Number(amount) <= 0 ||
      !reason.trim()
    ) {
      setLocalError("Enter a positive amount and a reason.");
      return;
    }
    setLocalError("");
    void onSubmit({ amount, reason: reason.trim() });
  }
  return (
    <form onSubmit={submit} className="space-y-4" aria-busy={pending}>
      <p className="text-sm">
        Maximum refundable: <strong>{maxRefundableAmount}</strong>
      </p>
      <TextField
        name="amount"
        label="Refund amount"
        type="number"
        value={amount}
        required
        error={errors.amount}
        onChange={setAmount}
      />
      <TextField
        name="reason"
        label="Refund reason"
        value={reason}
        required
        error={errors.reason}
        onChange={setReason}
      />
      {localError && <StatusMessage kind="error" message={localError} />}
      <Button type="submit" loading={pending}>
        Request refund
      </Button>
    </form>
  );
}
