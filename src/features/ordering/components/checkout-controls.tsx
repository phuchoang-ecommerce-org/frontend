"use client";

import { useId } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui";
import { useCheckoutStep } from "../hooks/use-checkout-step";
import type { AddressOption, ShippingOption } from "../types";

export function CheckoutSteps({
  steps,
  firstUnfinishedStep = 0,
  canAdvance = true,
  panels,
  children,
}: {
  steps: string[];
  firstUnfinishedStep?: number;
  canAdvance?: boolean;
  panels?: ReactNode[];
  children?: ReactNode;
}) {
  const { step, back, next } = useCheckoutStep(steps, firstUnfinishedStep);
  return (
    <section aria-label="Checkout steps">
      <ol className="flex flex-wrap gap-2 border-b border-border pb-3">
        {steps.map((label, index) => (
          <li
            key={label}
            aria-current={index === step ? "step" : undefined}
            className={`rounded-control px-3 py-2 text-sm ${index === step ? "bg-primary text-primary-foreground" : "bg-soft"}`}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>
      <div className="py-4">{panels?.[step] ?? children}</div>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={step === 0} onClick={back}>
          Back
        </Button>
        <Button
          disabled={!canAdvance || step >= steps.length - 1}
          onClick={next}
        >
          Next
        </Button>
      </div>
    </section>
  );
}

export function AddressPicker({
  addresses,
  selectedId,
  onSelect,
  onAdd,
}: {
  addresses: AddressOption[];
  selectedId?: string;
  onSelect: (addressId: string) => void;
  onAdd: () => void;
}) {
  const name = useId();
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 font-semibold">Shipping address</legend>
      {addresses.map((address) => (
        <label
          key={address.id}
          className="flex cursor-pointer gap-3 rounded-card border border-border p-3 has-checked:border-primary"
        >
          <input
            type="radio"
            name={name}
            value={address.id}
            checked={selectedId === address.id}
            onChange={() => onSelect(address.id)}
            className="mt-1 accent-primary"
          />
          <span>
            <strong>{address.label}</strong>
            <span className="block text-sm text-muted-foreground">
              {address.lines.join(", ")}
            </span>
          </span>
        </label>
      ))}
      {!addresses.length && (
        <p className="text-sm text-muted-foreground">
          Add an address to continue.
        </p>
      )}
      <Button variant="secondary" onClick={onAdd}>
        Add address
      </Button>
    </fieldset>
  );
}

export function ShippingOptionPicker({
  options,
  selectedId,
  onSelect,
}: {
  options: ShippingOption[];
  selectedId?: string;
  onSelect: (optionId: string) => void;
}) {
  const name = useId();
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 font-semibold">Shipping option</legend>
      {options.map((option) => (
        <label
          key={option.id}
          className="flex cursor-pointer justify-between gap-3 rounded-card border border-border p-3 has-checked:border-primary"
        >
          <span className="flex gap-3">
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={selectedId === option.id}
              disabled={!option.available}
              onChange={() => onSelect(option.id)}
              className="accent-primary"
            />
            <span>
              <strong>{option.label}</strong>
              <span className="block text-sm text-muted-foreground">
                {option.available
                  ? (option.estimate ?? "Delivery estimate unavailable")
                  : "Unavailable"}
              </span>
            </span>
          </span>
          <span className="tabular-nums">{option.fee}</span>
        </label>
      ))}
      {!options.length && (
        <p className="text-sm text-muted-foreground">
          No shipping options are available for this address.
        </p>
      )}
    </fieldset>
  );
}

export function PlaceOrderButton({
  canPlace,
  pending = false,
  onPlaceOrder,
}: {
  canPlace: boolean;
  pending?: boolean;
  onPlaceOrder: () => void | Promise<void>;
}) {
  return (
    <Button
      disabled={!canPlace}
      loading={pending}
      onClick={() => void onPlaceOrder()}
    >
      Place order
    </Button>
  );
}
