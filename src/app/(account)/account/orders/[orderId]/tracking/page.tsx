import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout";
import { TrackingTimeline } from "@/features/shipping/components/tracking-timeline";
import { getOrderTracking } from "@/lib/api/shipping";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Shipment tracking | ECP",
  robots: { index: false, follow: false },
};

async function getTracking(accessToken: string, orderId: string) {
  try {
    return await getOrderTracking(accessToken, orderId);
  } catch (error) {
    if (error instanceof Response && error.status === 404) notFound();
    throw error;
  }
}

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await getSession();
  if (!session) return null;
  const { orderId } = await params;

  const tracking = await getTracking(session.accessToken, orderId);
  return (
    <PageShell
      title={`Tracking for order ${tracking.orderNumber ?? tracking.orderId}`}
      actions={
        <Link
          className="text-sm font-medium underline underline-offset-4"
          href={`/account/orders/${encodeURIComponent(tracking.orderId)}`}
        >
          Order details
        </Link>
      }
    >
      <TrackingTimeline
        shipments={tracking.shipments ?? []}
        orderStatus={tracking.status}
        {...(tracking.estimatedDeliveryFrom
          ? { estimatedDeliveryFrom: tracking.estimatedDeliveryFrom }
          : {})}
        {...(tracking.estimatedDeliveryTo
          ? { estimatedDeliveryTo: tracking.estimatedDeliveryTo }
          : {})}
      />
    </PageShell>
  );
}
