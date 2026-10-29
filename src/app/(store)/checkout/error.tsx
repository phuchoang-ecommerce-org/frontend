"use client";

import { useEffect } from "react";
import { PageShell } from "@/components/layout";
import { ErrorState } from "@/components/ui";

export default function CheckoutError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Checkout route failed", error.digest ?? "no-correlation-id"); }, [error]);
  return <PageShell title="Checkout"><ErrorState title="Checkout could not be loaded" message={`Try again. Support reference: ${error.digest ?? "unavailable"}`} actionLabel="Try again" onAction={reset} /></PageShell>;
}
