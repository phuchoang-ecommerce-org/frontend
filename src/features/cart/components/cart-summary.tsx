import Link from "next/link";
import { Card } from "@/components/ui";
import type { CartTotals } from "../types";

export function CartSummary({ summary }: { summary: CartTotals }) {
  return (
    <Card title="Cart summary">
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{summary.subtotal}</dd>
        </div>
        {summary.discount && (
          <div className="flex justify-between gap-3">
            <dt>Discount</dt>
            <dd className="tabular-nums">{summary.discount}</dd>
          </div>
        )}
        {summary.shipping && (
          <div className="flex justify-between gap-3">
            <dt>Shipping</dt>
            <dd className="tabular-nums">{summary.shipping}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3 border-t border-border pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{summary.total}</dd>
        </div>
      </dl>
      {summary.canCheckout ? (
        <Link
          href="/checkout"
          className="mt-4 inline-flex min-h-control items-center rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Checkout
        </Link>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Resolve unavailable items before checkout.
        </p>
      )}
    </Card>
  );
}
