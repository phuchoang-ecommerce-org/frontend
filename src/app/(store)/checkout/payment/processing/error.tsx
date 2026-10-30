"use client";

import { useEffect } from "react";
import { PageShell } from "@/components/layout";
import { ErrorState } from "@/components/ui";

export default function PaymentProcessingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Payment processing route failed", error.digest ?? "no-correlation-id");
  }, [error]);

  return (
    <PageShell title="Checking your payment">
      <ErrorState
        title="Payment status could not be loaded"
        message={`Your payment has not been retried. Try checking its status again. Support reference: ${error.digest ?? "unavailable"}`}
        actionLabel="Check again"
        onAction={reset}
      />
    </PageShell>
  );
}
