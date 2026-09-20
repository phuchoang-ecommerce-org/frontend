import { PackageSearch } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControl } from "@/components/ui/pagination";

import { listOrders } from "../server/queries";
import { orderCursor, ordersHref, type OrderSearchParams } from "../url/orders";
import { OrdersTable } from "./orders-table";

export async function OrdersPage({
  searchParams,
}: {
  searchParams: OrderSearchParams;
}) {
  const cursor = orderCursor(searchParams);
  const page = await listOrders(cursor);

  if (page.items.length === 0) {
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
        nextHref={page.next ? ordersHref(page.next) : undefined}
      />
    </div>
  );
}
