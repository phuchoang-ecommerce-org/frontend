import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout";
import { EmptyState, StatusMessage } from "@/components/ui";
import { CartSummary, GuestCartLine } from "@/features/cart/components";
import { changeCartQuantityAction, removeCartLineAction } from "@/features/cart/server/actions";
import { cartDisplay, getCurrentCart } from "@/features/cart/server/queries";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Cart | ECP" };

export default async function CartPage() {
  const [cart, session] = await Promise.all([getCurrentCart(), getSession()]);
  const { lines, totals, expired } = cartDisplay(cart);
  return (
    <PageShell title="Your cart" actions={<Link href="/products" className="text-sm font-medium underline underline-offset-4">Continue browsing</Link>}>
      {session?.cartMergeNotices?.map((notice) => (
        <div className="mb-3" key={notice}>
          <StatusMessage kind="info" message={notice} />
        </div>
      ))}
      {expired && <div className="mb-5"><StatusMessage kind="info" message="Your previous cart expired. Start a new cart by adding a product." /></div>}
      {!lines.length ? (
        <EmptyState title="Your cart is empty" message="Browse products to find something to add." actionLabel="View products" actionHref="/products" />
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section aria-label="Cart items">
            {lines.map((line) => (
              <GuestCartLine
                key={line.id}
                line={line}
                onQuantityChange={changeCartQuantityAction.bind(null, cart!.id, line.id)}
                onRemove={removeCartLineAction.bind(null, cart!.id, line.id)}
              />
            ))}
          </section>
          <div className="space-y-4">
            <CartSummary summary={totals} checkoutHref={session ? "/checkout" : "/login?returnTo=%2Fcart"} />
            {!session && <p className="text-sm text-muted-foreground">Sign in or <Link href="/register" className="underline underline-offset-4">create an account</Link> before checkout. Your guest cart stays available when you sign in.</p>}
          </div>
        </div>
      )}
    </PageShell>
  );
}
