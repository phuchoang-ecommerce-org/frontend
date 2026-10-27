import type { Metadata } from "next";
import { PageShell } from "@/components/layout";
import { ErrorState } from "@/components/ui";
import { AddressBook } from "@/features/identity/components";
import {
  removeAddressAction,
  saveAddressAction,
} from "@/features/identity/server/addresses";
import { listAddresses } from "@/lib/api/addresses";
import { getSession } from "@/lib/session";
import type { AddressData } from "@/features/identity/types";

export const metadata: Metadata = { title: "Shipping addresses | ECP" };

export default async function AddressesPage() {
  const session = await getSession();
  if (!session) return null;
  let addresses: AddressData[];
  try {
    addresses = (await listAddresses(session.accessToken)).map((address) => ({
      id: address.id,
      label: address.label ?? "",
      recipientName: address.recipientName,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      region: address.region ?? "",
      postalCode: address.postalCode,
      countryCode: address.countryCode,
      phone: address.phone ?? "",
      isDefaultShipping: address.isDefaultShipping ?? false,
      isDefaultBilling: address.isDefaultBilling ?? false,
    }));
  } catch {
    return (
      <PageShell title="Shipping addresses">
        <ErrorState
          title="Addresses could not be loaded"
          message="The address service is unavailable. Try the page again."
          actionLabel="Try again"
          actionHref="/account/addresses"
        />
      </PageShell>
    );
  }

  return (
    <PageShell title="Shipping addresses">
      <AddressBook
        addresses={addresses}
        onSave={saveAddressAction}
        onRemove={removeAddressAction}
      />
    </PageShell>
  );
}
