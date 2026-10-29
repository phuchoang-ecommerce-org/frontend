"use client";

import { PageShell } from "@/components/layout";
import { ErrorState } from "@/components/ui";

export default function OrdersError({ reset }: { error: Error; reset: () => void }) {
  return (
    <PageShell title="Your orders">
      <ErrorState
        title="Orders could not be loaded"
        message="Your order history is temporarily unavailable. Try again."
        actionLabel="Try again"
        onAction={reset}
      />
    </PageShell>
  );
}
