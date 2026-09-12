"use client";

import { useActionState, useRef } from "react";
import { AlertCircle } from "lucide-react";

import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CsrfField } from "@/components/ui/csrf-field";
import type { CustomerAddress } from "@/features/identity/schema/address";
import type { ActionResult } from "@/features/identity/server/error-mapping";

export interface AddressFormProps {
  address?: CustomerAddress;
  /** Bound to `addOwnAddress` or `replaceOwnAddress(addressId, ...)` by the caller — this component knows nothing about which. */
  submitAction: (input: unknown) => Promise<ActionResult<CustomerAddress>>;
  onSaved?: (address: CustomerAddress) => void;
}

const emptyState: ActionResult<CustomerAddress> = { ok: false };

/** Shared by the add-address flow (inside a Modal) and the edit flow (`/account/addresses/[addressId]`) — Feature Structure.md §5. */
export function AddressForm({ address, submitAction, onSaved }: AddressFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult<CustomerAddress>, formData: FormData): Promise<ActionResult<CustomerAddress>> => {
      const result = await submitAction({
        label: formData.get("label") || undefined,
        recipientName: formData.get("recipientName"),
        line1: formData.get("line1"),
        line2: formData.get("line2") || undefined,
        city: formData.get("city"),
        region: formData.get("region") || undefined,
        postalCode: formData.get("postalCode"),
        countryCode: formData.get("countryCode"),
        phone: formData.get("phone") || undefined,
        isDefaultShipping: formData.get("isDefaultShipping") === "on",
        isDefaultBilling: formData.get("isDefaultBilling") === "on",
        csrfToken: formData.get("csrfToken"),
      });
      if (result.ok && result.data) onSaved?.(result.data);
      return result;
    },
    emptyState,
  );

  return (
    <div className="flex flex-col gap-4">
      {state.formError ? (
        <EmptyState
          icon={AlertCircle}
          title={state.formError.message}
          action={{
            label: "Try again",
            onClick: () => formRef.current?.querySelector("input")?.focus(),
          }}
        />
      ) : null}
      <Form ref={formRef} action={formAction}>
        <CsrfField />
        <FormField name="label" label="Label (optional)" error={state.fieldErrors?.label}>
          <Input type="text" defaultValue={address?.label ?? ""} />
        </FormField>
        <FormField name="recipientName" label="Recipient name" error={state.fieldErrors?.recipientName}>
          <Input type="text" required defaultValue={address?.recipientName ?? ""} />
        </FormField>
        <FormField name="line1" label="Address line 1" error={state.fieldErrors?.line1}>
          <Input type="text" required defaultValue={address?.line1 ?? ""} />
        </FormField>
        <FormField name="line2" label="Address line 2 (optional)" error={state.fieldErrors?.line2}>
          <Input type="text" defaultValue={address?.line2 ?? ""} />
        </FormField>
        <FormField name="city" label="City" error={state.fieldErrors?.city}>
          <Input type="text" required defaultValue={address?.city ?? ""} />
        </FormField>
        <FormField name="region" label="Region (optional)" error={state.fieldErrors?.region}>
          <Input type="text" defaultValue={address?.region ?? ""} />
        </FormField>
        <FormField name="postalCode" label="Postal code" error={state.fieldErrors?.postalCode}>
          <Input type="text" required defaultValue={address?.postalCode ?? ""} />
        </FormField>
        <FormField name="countryCode" label="Country code (ISO 3166-1 alpha-2)" error={state.fieldErrors?.countryCode}>
          <Input type="text" required maxLength={2} defaultValue={address?.countryCode ?? ""} />
        </FormField>
        <FormField name="phone" label="Phone (optional)" error={state.fieldErrors?.phone}>
          <Input type="tel" defaultValue={address?.phone ?? ""} />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-neutral-900">
          <input
            type="checkbox"
            name="isDefaultShipping"
            defaultChecked={address?.isDefaultShipping ?? false}
            className="size-4"
          />
          Default shipping address
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-900">
          <input
            type="checkbox"
            name="isDefaultBilling"
            defaultChecked={address?.isDefaultBilling ?? false}
            className="size-4"
          />
          Default billing address
        </label>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : address ? "Save changes" : "Add address"}
        </Button>
      </Form>
    </div>
  );
}
