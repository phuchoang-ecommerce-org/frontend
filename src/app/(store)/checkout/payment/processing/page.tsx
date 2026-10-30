import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/components/layout";
import { PaymentProcessingPanel } from "@/features/payment/components";
import { getOrder } from "@/lib/api/ordering";
import { getOrderPayment, type Payment } from "@/lib/api/payment";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Checking payment | ECP",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function orderHref(orderId: string): string {
  return `/account/orders/${encodeURIComponent(orderId)}`;
}

function paymentState(payment: Payment | null): "pending" | "failed" {
  if (!payment) return "pending";
  return ["FAILED", "DECLINED", "CANCELLED"].includes(payment.status)
    ? "failed"
    : "pending";
}

function checkedAt(): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
}

/**
 * This route only reads state. It intentionally treats a payment snapshot that
 * has not arrived from OrderCreated yet as Pending, rather than re-initiating
 * a payment or inventing a new idempotency key.
 */
export default async function PaymentProcessingPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  if (!orderId) notFound();

  const session = await getSession();
  const returnTo = `/checkout/payment/processing?orderId=${encodeURIComponent(orderId)}`;
  if (!session) redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  if (session.restricted || !session.account.roles.includes("CUSTOMER")) notFound();

  let order;
  try {
    order = await getOrder(session.accessToken, orderId);
  } catch (error) {
    if (error instanceof Response && error.status === 404) notFound();
    throw error;
  }

  let payment: Payment | null = null;
  try {
    payment = await getOrderPayment(session.accessToken, order.id);
  } catch (error) {
    // A payment snapshot may legitimately lag the OrderCreated event. Any
    // other unavailable read remains uncertain and must not become a failure.
    if (!(error instanceof Response) || error.status !== 404) payment = null;
  }

  const href = orderHref(order.id);
  if (payment?.status === "CAPTURED" && order.status === "PAID") redirect(href);

  const state = paymentState(payment);
  const detail = !payment
    ? "Your order is ready. We are waiting for its payment record to become available."
    : payment.status === "CAPTURED"
      ? "Your payment is confirmed. We are waiting for your order status to update."
      : undefined;

  return (
    <PageShell title="Checking your payment">
      <PaymentProcessingPanel
        state={state}
        orderHref={href}
        lastCheckedAt={checkedAt()}
        {...(detail ? { detail } : {})}
      />
    </PageShell>
  );
}
