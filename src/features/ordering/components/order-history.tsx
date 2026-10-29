import Link from "next/link";
import { EmptyState } from "@/components/ui";
import { focusRing } from "@/components/ui/styles";
import { formatMoney } from "@/lib/format/money";
import type { Order, OrderPageResult } from "@/lib/api/ordering";
import { OrderCard } from "./order-display";

function formatPlacedAt(value: string | undefined): string {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

function cardOrder(order: Order) {
  return {
    id: order.orderNumber,
    href: `/account/orders/${encodeURIComponent(order.id)}`,
    placedAt: formatPlacedAt(order.placedAt ?? order.createdAt),
    status: order.status.replaceAll("_", " "),
    total: formatMoney(order.total),
    itemCount: order.lines.reduce((count, line) => count + line.quantity, 0),
  };
}

export function OrderHistory({ page, cursor }: { page: OrderPageResult; cursor?: string }) {
  const orders = page.items;
  const next = page.page?.next;

  if (!orders.length) {
    return (
      <EmptyState
        title="No orders yet"
        message="When you place an order, its price and delivery details will appear here."
        actionLabel="Browse products"
        actionHref="/products"
      />
    );
  }

  return (
    <section aria-label="Order history" className="space-y-4">
      <ol className="space-y-3">
        {orders.map((order) => (
          <li key={order.id}>
            <OrderCard order={cardOrder(order)} />
          </li>
        ))}
      </ol>
      {next && (
        <nav aria-label="Order history pages" className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">Showing the most recent available orders.</p>
          <Link
            href={`/account/orders?cursor=${encodeURIComponent(next)}`}
            scroll={false}
            className={`inline-flex min-h-control items-center rounded-control px-3 text-sm font-medium text-primary underline underline-offset-4 ${focusRing}`}
          >
            Older orders
          </Link>
        </nav>
      )}
      {cursor && (
        <Link
          href="/account/orders"
          scroll={false}
          className={`inline-flex min-h-control items-center rounded-control px-2 text-sm font-medium text-primary underline underline-offset-4 ${focusRing}`}
        >
          Back to recent orders
        </Link>
      )}
    </section>
  );
}
