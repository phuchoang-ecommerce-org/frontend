"use client";

import Link from "next/link";
import { Button, StatusMessage } from "@/components/ui";
import { usePaymentStatusRefresh } from "../hooks/use-payment-status-refresh";
import { PaymentStatePanel } from "./payment-state-panel";

export function PaymentProcessingPanel({
  state,
  orderHref,
  lastCheckedAt,
  detail,
}: {
  state: "pending" | "failed";
  orderHref: string;
  lastCheckedAt: string;
  detail?: string;
}) {
  const { checkNow, pollingStopped } = usePaymentStatusRefresh(
    state === "pending",
  );

  return (
    <div className="max-w-xl space-y-4">
      <PaymentStatePanel state={state} lastCheckedAt={lastCheckedAt}>
        {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
      </PaymentStatePanel>
      {state === "pending" && pollingStopped && (
        <StatusMessage
          kind="info"
          message="Automatic checks have paused. You can check again when you are ready."
        />
      )}
      <div className="flex flex-wrap gap-3">
        {state === "pending" && <Button onClick={checkNow}>Check again</Button>}
        <Link
          href={orderHref}
          className="inline-flex min-h-control items-center justify-center rounded-control border border-input bg-background px-4 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          View order
        </Link>
      </div>
    </div>
  );
}
