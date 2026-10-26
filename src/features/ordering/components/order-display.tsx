import Link from "next/link";
import type { ReactNode } from "react";
import { Badge, Card, EmptyState } from "@/components/ui";
import { focusRing } from "@/components/ui/styles";
import type { Order, OrderTotals } from "../types";

export function OrderStatus({
  label,
  kind = "info",
}: {
  label: string;
  kind?: "info" | "success" | "error";
}) {
  return <Badge label={label} kind={kind} />;
}
export function OrderCard({ order }: { order: Order }) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={order.href}
            className={`font-semibold hover:underline ${focusRing}`}
          >
            Order {order.id}
          </Link>
          <p className="text-sm text-muted-foreground">
            Placed {order.placedAt} · {order.itemCount} items
          </p>
        </div>
        <OrderStatus label={order.status} />
      </div>
      <p className="mt-3 font-medium tabular-nums">{order.total}</p>
    </Card>
  );
}
export function OrderSummary({
  summary,
  children,
}: {
  summary: OrderTotals;
  children?: ReactNode;
}) {
  return (
    <Card title="Order summary">
      {summary.lines.length ? (
        <ul className="space-y-2">
          {summary.lines.map((line) => (
            <li key={line.id} className="flex justify-between gap-3 text-sm">
              <span>
                {line.name} × {line.quantity}
              </span>
              <span className="tabular-nums">{line.total}</span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No items"
          message="Add items before placing an order."
        />
      )}
      <dl className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{summary.subtotal}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd>{summary.shipping}</dd>
        </div>
        {summary.discount && (
          <div className="flex justify-between">
            <dt>Discount</dt>
            <dd>{summary.discount}</dd>
          </div>
        )}
        {summary.tax && (
          <div className="flex justify-between">
            <dt>Tax</dt>
            <dd>{summary.tax}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{summary.total}</dd>
        </div>
      </dl>
      {summary.updatedAt && (
        <p className="mt-2 text-xs text-muted-foreground">
          Updated {summary.updatedAt}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </Card>
  );
}
