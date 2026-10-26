"use client";

import { PageShell } from "@/components/layout";
import { ErrorState } from "@/components/ui";

export default function StoreError({ reset }: { error: Error; reset: () => void }) {
  return (
    <PageShell title="500 Internal Server Error">
      <ErrorState
        title="We couldn't load this page"
        message="The API request failed. Try again in a moment."
        actionLabel="Try again"
        onAction={reset}
      />
    </PageShell>
  );
}
