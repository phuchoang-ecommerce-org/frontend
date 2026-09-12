import Link from "next/link";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { CustomerAddress } from "@/features/identity/schema/address";
import { RemoveAddressButton } from "./remove-address-button";

export function AddressesTable({ addresses }: { addresses: CustomerAddress[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Label</TableHead>
          <TableHead>Recipient</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Default</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {addresses.map((address) => (
          <TableRow key={address.id}>
            <TableCell>{address.label ?? "—"}</TableCell>
            <TableCell>{address.recipientName}</TableCell>
            <TableCell>
              {address.line1}, {address.city}, {address.countryCode}
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                {address.isDefaultShipping ? <Badge>Shipping</Badge> : null}
                {address.isDefaultBilling ? <Badge>Billing</Badge> : null}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Link
                  href={`/account/addresses/${address.id}`}
                  className="rounded-control px-2 py-1 text-sm text-primary hover:bg-neutral-50"
                >
                  Edit
                </Link>
                <RemoveAddressButton addressId={address.id} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
