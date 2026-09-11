import type { ReactNode } from "react";
import Link from "next/link";

// Nested inside (storefront), not a fifth route group — the customer is
// still shopping; what changes is that navigation is suppressed so the
// funnel has one exit (Routing.md §2, UI Design System "one primary
// objective"). R3: dynamic, never cached (ADR-0019).
export const dynamic = "force-dynamic";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-content px-4 py-6">
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
        <span className="text-lg font-semibold text-primary">Checkout</span>
        <Link href="/cart" className="text-sm text-neutral-700">
          Return to cart
        </Link>
      </div>
      {children}
    </div>
  );
}
