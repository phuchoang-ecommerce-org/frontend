import Link from "next/link";

import { Input } from "@/components/ui/input";

export interface HeaderProps {
  /** Number of items in the cart, or undefined for a guest with an empty cart. */
  cartCount?: number;
}

// Presentational only (rule I-5) — the (storefront) layout supplies
// cartCount from a features/cart query; this component never fetches.
export function Header({ cartCount }: HeaderProps) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-content items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-primary">
          ECP
        </Link>
        <form
          role="search"
          action="/search"
          className="flex-1"
        >
          <Input
            type="search"
            name="q"
            aria-label="Search products"
            placeholder="Search products"
          />
        </form>
        <Link
          href="/cart"
          aria-label={`Cart, ${cartCount ?? 0} item${cartCount === 1 ? "" : "s"}`}
          className="text-sm font-medium text-primary"
        >
          Cart{cartCount ? ` (${cartCount})` : ""}
        </Link>
      </div>
    </header>
  );
}
