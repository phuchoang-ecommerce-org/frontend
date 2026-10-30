import { Badge, Card } from "@/components/ui";
import { formatMoney } from "@/lib/format/money";
import type { Order } from "@/lib/api/ordering";

function formatDate(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function addressLines(address: Order["shippingAddress"]): string[] {
  if (!address) return [];
  return [
    address.recipientName,
    address.line1,
    address.line2,
    [address.city, address.region, address.postalCode]
      .filter(Boolean)
      .join(", "),
    address.countryCode,
    address.phone,
  ].filter((line): line is string => Boolean(line));
}

function statusKind(status: string): "info" | "success" | "error" {
  if (["PAID", "DELIVERED", "COMPLETED"].includes(status)) return "success";
  if (["PAYMENT_FAILED", "CANCELLED", "REFUNDED"].includes(status))
    return "error";
  return "info";
}

export function OrderDetail({ order }: { order: Order }) {
  const placedAt = formatDate(order.placedAt ?? order.createdAt);
  const shipping = addressLines(order.shippingAddress);
  const billing = addressLines(order.billingAddress);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-5">
        <Card title="Items in this order">
          <ul className="divide-y divide-border" aria-label="Ordered items">
            {order.lines.map((line) => (
              <li
                key={line.id}
                className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="font-medium text-primary">{line.productName}</p>
                  {line.variantName && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {line.variantName}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {line.quantity} × {formatMoney(line.unitPriceAtOrder)}
                  </p>
                  {line.lineDiscount && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Line discount: −{formatMoney(line.lineDiscount)}
                    </p>
                  )}
                </div>
                <p className="shrink-0 tabular-nums">
                  {formatMoney(line.lineTotal)}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Addresses">
          <div className="grid gap-6 sm:grid-cols-2">
            <section aria-labelledby="shipping-address-heading">
              <h3 id="shipping-address-heading" className="text-sm font-medium">
                Delivery address
              </h3>
              {shipping.length ? (
                <address className="mt-2 not-italic text-sm leading-6 text-muted-foreground">
                  {shipping.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  No delivery address was recorded.
                </p>
              )}
            </section>
            <section aria-labelledby="billing-address-heading">
              <h3 id="billing-address-heading" className="text-sm font-medium">
                Billing address
              </h3>
              {billing.length ? (
                <address className="mt-2 not-italic text-sm leading-6 text-muted-foreground">
                  {billing.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Same as delivery address or not recorded.
                </p>
              )}
            </section>
          </div>
        </Card>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-4">
        <Card title="Order summary">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">{order.orderNumber}</p>
            <Badge
              label={order.status.replaceAll("_", " ")}
              kind={statusKind(order.status)}
            />
          </div>
          {placedAt && (
            <p className="mt-2 text-sm text-muted-foreground">
              Placed {placedAt}
            </p>
          )}
          <dl className="mt-5 space-y-2 border-t border-border pt-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatMoney(order.subtotal)}</dd>
            </div>
            {order.discount && (
              <div className="flex justify-between gap-3">
                <dt>Discount</dt>
                <dd className="tabular-nums">−{formatMoney(order.discount)}</dd>
              </div>
            )}
            {order.shippingFee && (
              <div className="flex justify-between gap-3">
                <dt>Shipping</dt>
                <dd className="tabular-nums">
                  {formatMoney(order.shippingFee)}
                </dd>
              </div>
            )}
            {order.tax && (
              <div className="flex justify-between gap-3">
                <dt>Tax</dt>
                <dd className="tabular-nums">{formatMoney(order.tax)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-3 border-t border-border pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatMoney(order.total)}</dd>
            </div>
          </dl>
        </Card>
      </aside>
    </div>
  );
}
