import { listOwnAddresses } from "@/features/identity/server/queries";
import { AddressesTable } from "@/features/identity/components/addresses-table";
import { AddAddressDialog } from "@/features/identity/components/add-address-dialog";
import { PaginationControl } from "@/components/ui/pagination";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AddressesPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  const { cursor } = await searchParams;
  const page = await listOwnAddresses(cursor);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary">Addresses</h1>
        <AddAddressDialog />
      </div>
      <AddressesTable addresses={page.items} />
      <PaginationControl
        count={page.items.length}
        hasNext={page.next !== null}
        nextHref={page.next ? `/account/addresses?cursor=${encodeURIComponent(page.next)}` : undefined}
      />
    </div>
  );
}
