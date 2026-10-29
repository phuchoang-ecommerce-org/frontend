import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/layout";
import { Card, StatusMessage } from "@/components/ui";
import { listAddresses } from "@/lib/api/addresses";
import { getCurrentCheckout } from "@/lib/api/ordering";
import { listEligiblePaymentMethods } from "@/lib/api/payment";
import { getSession } from "@/lib/session";
import { cartDisplay, getCurrentCart } from "@/features/cart/server/queries";
import { CheckoutFlow } from "@/features/ordering/components/checkout-flow";
import { StartCheckoutButton } from "@/features/ordering/components/start-checkout-button";

export const metadata: Metadata = { title: "Checkout | ECP", robots: { index: false, follow: false } };

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/login?returnTo=%2Fcheckout");
  if (session.restricted || session.account.verificationStatus !== "VERIFIED" || !session.account.roles.includes("CUSTOMER")) {
    return <PageShell title="Verify your email"><div className="max-w-xl space-y-4"><StatusMessage kind="info" message="Verify your email before checkout. Your cart is still saved." /><Link href="/verify-email" className="inline-flex min-h-control items-center rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground">Verify email or request a new link</Link></div></PageShell>;
  }
  const cart = await getCurrentCart();
  const display = cartDisplay(cart);
  if (!display.totals.canCheckout) redirect("/cart");
  let checkout: Awaited<ReturnType<typeof getCurrentCheckout>> | null = null;
  try { checkout = await getCurrentCheckout(session.accessToken); } catch (error) { if (!(error instanceof Response) || error.status !== 404) throw error; }
  if (!checkout) {
    return <PageShell title="Checkout"><Card title="Ready to review your delivery details?"><div className="space-y-4"><p className="max-w-prose text-muted-foreground">We will create or resume one draft order for this cart. Stock is not reserved until you confirm an order later.</p><StartCheckoutButton /></div></Card></PageShell>;
  }
  const [addresses, paymentMethods] = await Promise.all([
    listAddresses(session.accessToken),
    listEligiblePaymentMethods(session.accessToken, checkout.order.id).catch(() => []),
  ]);
  return <PageShell title="Checkout" actions={<Link href="/cart" className="text-sm font-medium underline underline-offset-4">Return to cart</Link>}><CheckoutFlow checkout={checkout} addresses={addresses} paymentMethods={paymentMethods} /></PageShell>;
}
