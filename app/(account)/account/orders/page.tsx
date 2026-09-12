import { PackageSearch } from "lucide-react";

import { listOrders } from "@/features/ordering/server/queries";
import { OrdersTable } from "@/features/ordering/components/orders-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControl } from "@/components/ui/pagination";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  const { cursor } = await searchParams;
  const page = await listOrders(cursor);

  if (page.items.length === 0) {
    // Expected against the real API this sprint — `ordering` doesn't exist
    // until Sprint 18 (sprint-05-identity-account.md Integration Risk note).
    // This is the designed deliverable, not a degraded state.
    return (
      <EmptyState
        icon={PackageSearch}
        title="No orders yet"
        description="When you place an order, it will appear here."
        action={{ label: "Start shopping", href: "/" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-primary">Orders</h1>
      <OrdersTable orders={page.items} />
      <PaginationControl
        count={page.items.length}
        hasNext={page.next !== null}
        nextHref={page.next ? `/account/orders?cursor=${encodeURIComponent(page.next)}` : undefined}
      />
    </div>
  );
}
