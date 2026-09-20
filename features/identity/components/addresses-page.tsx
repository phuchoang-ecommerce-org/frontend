import { PaginationControl } from "@/components/ui/pagination";

import {
  addressCursor,
  addressesHref,
  type AddressSearchParams,
} from "../url/addresses";
import { listOwnAddresses } from "../server/queries";
import { AddAddressDialog } from "./add-address-dialog";
import { AddressesTable } from "./addresses-table";

export async function AddressesPage({
  searchParams,
}: {
  searchParams: AddressSearchParams;
}) {
  const cursor = addressCursor(searchParams);
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
        nextHref={page.next ? addressesHref(page.next) : undefined}
      />
    </div>
  );
}
