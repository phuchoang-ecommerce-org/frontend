import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageShell } from "@/components/layout";
import { LoadingSkeleton } from "@/components/ui";
import { OrderDetail } from "@/features/ordering/components/order-detail";
import { OrderPaymentStatus } from "@/features/ordering/components/order-payment-status";
import { getOrder } from "@/lib/api/ordering";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Order details | ECP",
  robots: { index: false, follow: false },
};

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const session = await getSession();
  if (!session) return null;
  const { orderId } = await params;
  let order;

  try {
    order = await getOrder(session.accessToken, orderId);
  } catch (error) {
    if (error instanceof Response && error.status === 404) notFound();
    throw error;
  }

  return (
    <PageShell title={`Order ${order.orderNumber}`} actions={<Link className="text-sm font-medium underline underline-offset-4" href="/account/orders">All orders</Link>}>
      <div className="grid items-start gap-6">
        <OrderDetail order={order} />
        <Link
          href={`/account/orders/${encodeURIComponent(order.id)}/tracking`}
          className="w-fit text-sm font-medium underline underline-offset-4"
        >
          Track shipment
        </Link>
        <section aria-label="Payment details" className="max-w-xs">
          <Suspense fallback={<LoadingSkeleton shape="card" />}>
            <OrderPaymentStatus accessToken={session.accessToken} orderId={order.id} />
          </Suspense>
        </section>
      </div>
    </PageShell>
  );
}
