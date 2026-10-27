import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { StoreHeader } from "@/components/layout";
import { AccountSignOutButton } from "@/features/identity/components";
import { logoutAction } from "@/features/identity/server/logout";
import { getCurrentCart } from "@/features/cart/server/queries";
import { getSession } from "@/lib/session";
import { focusRing } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "My account | ECP",
  robots: { index: false, follow: false },
};

const storeLinks = [
  { label: "Products", href: "/products" },
  { label: "Cart", href: "/cart" },
];

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?returnTo=%2Faccount%2Faddresses");
  let cartCount = 0;
  try {
    const cart = await getCurrentCart();
    cartCount = cart?.lines.reduce((total, line) => total + line.quantity, 0) ?? 0;
  } catch {
    // Account management remains usable when the cart service is unavailable.
  }

  return (
    <>
      <StoreHeader
        cartCount={cartCount}
        navLinks={storeLinks}
        accountLabel={session.account.displayName || session.account.email}
      />
      <div className="border-b border-border bg-muted/40">
        <nav aria-label="Account" className="mx-auto flex max-w-content flex-wrap items-center gap-2 px-3 py-2 sm:px-4 lg:px-6">
          <Link href="/account/addresses" className={`inline-flex min-h-control items-center rounded-control px-2 text-sm font-medium text-primary ${focusRing}`}>
            Addresses
          </Link>
          <span className="ms-auto"><AccountSignOutButton onSignOut={logoutAction} /></span>
        </nav>
      </div>
      {children}
    </>
  );
}
