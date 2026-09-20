import { notFound } from "next/navigation";

import { ApiProblem } from "@/lib/api";
import { replaceOwnAddress } from "@/features/identity/server/actions";
import type { ActionResult } from "@/features/identity/server/error-mapping";
import { getOwnAddress } from "@/features/identity/server/queries";
import type { CustomerAddress } from "@/features/identity/schema/address";

import { EditAddressForm } from "./edit-address-form";

export async function AddressDetailScreen({
  params,
}: {
  params: Promise<{ addressId: string }>;
}) {
  const { addressId } = await params;

  let address: CustomerAddress;
  try {
    address = await getOwnAddress(addressId);
  } catch (err) {
    // An address belonging to another customer is `404`, never `403`
    // (Integration Contract §2.1) — bubbles to the existing, non-disclosive
    // (account)/not-found.tsx, which never explains why.
    if (err instanceof ApiProblem && err.problem.status === 404) notFound();
    throw err;
  }

  // Bound here (Server Action closing over addressId) — a plain arrow function
  // wrapping another Server Action can't itself cross the Client Component
  // boundary without its own "use server" directive.
  async function replaceThisAddress(input: unknown): Promise<ActionResult<CustomerAddress>> {
    "use server";
    return replaceOwnAddress(addressId, input);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-primary">Edit address</h1>
      <EditAddressForm address={address} submitAction={replaceThisAddress} />
    </div>
  );
}
