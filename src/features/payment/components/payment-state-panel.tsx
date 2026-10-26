import type { ReactNode } from "react";
import { Badge, Card } from "@/components/ui";
import type { PaymentState } from "../types";

const paymentCopy: Record<
  PaymentState,
  { label: string; description: string; kind: "info" | "success" | "error" }
> = {
  pending: {
    label: "Pending payment",
    description: "The payment result is still being checked.",
    kind: "info",
  },
  paid: {
    label: "Paid",
    description: "Payment was confirmed.",
    kind: "success",
  },
  failed: {
    label: "Payment failed",
    description: "Payment was not completed. You may be able to retry.",
    kind: "error",
  },
  refunded: {
    label: "Refunded",
    description: "The refund was confirmed.",
    kind: "success",
  },
  cash_on_delivery: {
    label: "Cash on delivery",
    description: "Payment is due when the order arrives.",
    kind: "info",
  },
};
export function PaymentStatePanel({
  state,
  lastCheckedAt,
  children,
}: {
  state: PaymentState;
  lastCheckedAt?: string;
  children?: ReactNode;
}) {
  const copy = paymentCopy[state];
  return (
    <Card title="Payment">
      <div className="space-y-2">
        <Badge label={copy.label} kind={copy.kind} />
        <p className="text-sm">{copy.description}</p>
        {lastCheckedAt && (
          <p className="text-xs text-muted-foreground">
            Last checked {lastCheckedAt}
          </p>
        )}
        {children}
      </div>
    </Card>
  );
}
