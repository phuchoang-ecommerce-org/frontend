"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/inventory", label: "Inventory" },
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
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <nav
        aria-label="Admin"
        className="flex shrink-0 gap-1 overflow-x-auto border-b border-border bg-surface p-2 lg:w-56 lg:flex-col lg:border-r lg:border-b-0 lg:p-3"
      >
        {ADMIN_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(`${link.href}/`))
                ? "page"
                : undefined
            }
            className={cn(
              "shrink-0 rounded-control px-3 py-2 text-sm text-neutral-900 hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-primary/50",
              (pathname === link.href ||
                (link.href !== "/admin" &&
                  pathname.startsWith(`${link.href}/`))) &&
                "bg-primary text-background hover:bg-primary",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
