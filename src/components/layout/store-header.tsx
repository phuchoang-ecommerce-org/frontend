import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { NavigationLink } from "./types";
import { focusRing } from "../ui/styles";

export type StoreHeaderProps = {
  cartCount: number;
  navLinks: NavigationLink[];
  accountLabel?: string;
};

export function StoreHeader({
  cartCount,
  navLinks,
  accountLabel,
}: StoreHeaderProps) {
  return (
    <header className="border-b border-border bg-surface font-ui text-ink">
      <div className="mx-auto flex max-w-content flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2 sm:px-4 lg:px-6">
        <Link
          href="/"
          className={`rounded-control text-xl font-semibold text-primary ${focusRing}`}
        >
          Store
        </Link>
        <nav
          aria-label="Store"
          className="order-3 w-full sm:order-none sm:w-auto sm:flex-1"
        >
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`inline-flex min-h-control items-center rounded-control px-1 text-sm font-medium text-ink hover:text-primary ${focusRing}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ms-auto flex items-center gap-2">
          <Link
            href={accountLabel ? "/account" : "/login"}
            className={`inline-flex min-h-control items-center rounded-control text-sm font-medium text-primary hover:underline ${focusRing}`}
          >
            {accountLabel || "Sign in"}
          </Link>
          <Link
            href="/cart"
            aria-label={`Cart, ${cartCount} items`}
            className={`inline-flex min-h-control items-center gap-1 rounded-control px-1 text-sm font-medium text-primary hover:bg-soft ${focusRing}`}
          >
            <ShoppingBag size={18} aria-hidden="true" />
            <span aria-hidden="true">{cartCount}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
