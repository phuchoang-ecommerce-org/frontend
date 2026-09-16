import type { ReactNode } from "react";
import Link from "next/link";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/promotions", label: "Promotions" },
] as const;

export interface AdminShellProps {
  children: ReactNode;
}

// No storefront chrome — an operator console, not a second application
// (Routing.md §2). Cookie posture (Strict) is a middleware concern, not
// this component's — this is presentation only (rule I-5).
export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex min-h-full">
      <nav
        aria-label="Admin"
        className="w-56 flex shrink-0 flex-col gap-1 border-r border-border bg-surface p-3"
      >
        {ADMIN_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-control px-3 py-2 text-sm text-neutral-900 hover:bg-neutral-50"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
