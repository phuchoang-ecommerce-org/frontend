import type { ReactNode } from "react";
import { StoreHeader } from "@/components/layout";
import { getCurrentCart } from "@/features/cart/server/queries";
import { getSession } from "@/lib/session";

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  let cartCount = 0;
  try {
    const cart = await getCurrentCart();
    cartCount = cart?.lines.reduce((count, line) => count + line.quantity, 0) ?? 0;
  } catch {
    // Browsing stays available if the cart service is temporarily unavailable.
  }
  return (
    <>
      <StoreHeader
        cartCount={cartCount}
        navLinks={[{ label: "Products", href: "/products" }, { label: "Cart", href: "/cart" }]}
        accountLabel={session?.account.displayName || session?.account.email}
      />
      {children}
    </>
  );
}
