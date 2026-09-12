"use client";

import { useRouter } from "next/navigation";

import type { CustomerAddress } from "@/features/identity/schema/address";
import type { ActionResult } from "@/features/identity/server/error-mapping";
import { AddressForm } from "./address-form";

export interface EditAddressFormProps {
  address: CustomerAddress;
  submitAction: (input: unknown) => Promise<ActionResult<CustomerAddress>>;
}

export function EditAddressForm({ address, submitAction }: EditAddressFormProps) {
  const router = useRouter();
  return (
    <AddressForm
      address={address}
      submitAction={submitAction}
      onSaved={() => router.push("/account/addresses")}
    />
  );
}
