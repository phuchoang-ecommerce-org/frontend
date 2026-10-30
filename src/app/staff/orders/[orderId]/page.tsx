import { notFound } from "next/navigation";
import { getOrder } from "@/lib/api/ordering";
import { listOrderShipments } from "@/lib/api/shipping";
import { getSession } from "@/lib/session";
import { StaffOrderWorkspace } from "@/features/ordering/components/staff-order-workspace";
import { advanceOrderStatusAction, createShipmentAction } from "@/features/ordering/server/staff-actions";
import { StaffShipmentPanel } from "@/features/shipping/components/staff-shipment-panel";

export default async function StaffOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const session = await getSession();
  if (!session) return null;
  const [orderResult, shipmentResult] = await Promise.allSettled([getOrder(session.accessToken, orderId), listOrderShipments(session.accessToken, orderId)]);
  if (orderResult.status === "rejected" && orderResult.reason instanceof Response && orderResult.reason.status === 404) notFound();
  if (orderResult.status !== "fulfilled") throw orderResult.reason;
  const shipments = shipmentResult.status === "fulfilled" ? shipmentResult.value : [];
  const order = orderResult.value;
  return <main className="mx-auto max-w-content space-y-6 px-3 py-6 sm:px-4 lg:px-6"><header><p className="text-sm text-muted">Order {order.orderNumber}</p><h1 className="text-2xl font-semibold">{order.status}</h1></header>
    <StaffOrderWorkspace order={order} onAdvance={advanceOrderStatusAction} />
    <StaffShipmentPanel orderId={order.id} orderStatus={order.status} onCreate={createShipmentAction} />
    <section aria-labelledby="shipments-heading" className="rounded-card border border-border bg-surface p-4 sm:p-6"><h2 id="shipments-heading" className="text-lg font-semibold">Shipments</h2>{shipments.length ? <ul className="mt-3 space-y-2">{shipments.map((shipment) => <li key={shipment.id} className="text-sm">{shipment.carrier} · {shipment.status} · {shipment.trackingReference ?? "Tracking reference pending"}</li>)}</ul> : <p className="mt-2 text-sm text-muted">No shipments have been created.</p>}</section>
  </main>;
}
