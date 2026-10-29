import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/layout";
import { getCurrentCheckout, getOrderSummary } from "@/lib/api/ordering";
import { getSession } from "@/lib/session";
import { CheckoutReview } from "@/features/ordering/components/checkout-review";

export const metadata: Metadata = { title: "Review order | ECP", robots: { index: false, follow: false } };

async function summaryOrCart(accessToken: string, checkoutId: string) {
  try {
    return await getOrderSummary(accessToken, checkoutId);
  } catch (error) {
    if (error instanceof Response && error.status === 422) redirect("/cart");
    throw error;
  }
}

export default async function CheckoutReviewPage() {
  const session = await getSession();
  if (!session) redirect("/login?returnTo=%2Fcheckout%2Freview");
  const checkout = await getCurrentCheckout(session.accessToken);
  if (!checkout.ready) redirect("/checkout");
  const summary = await summaryOrCart(session.accessToken, checkout.order.id);
  return <PageShell title="Review your order"><CheckoutReview checkout={checkout} summary={summary} /></PageShell>;
}
