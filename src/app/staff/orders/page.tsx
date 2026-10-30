import Link from "next/link";
import { listOrders } from "@/lib/api/ordering";
import { getSession } from "@/lib/session";

export default async function StaffOrdersPage() {
  const session = await getSession();
  if (!session) return null;
  const orders = await listOrders(session.accessToken);
  return <main className="mx-auto max-w-content space-y-6 px-3 py-6 sm:px-4 lg:px-6"><div><h1 className="text-2xl font-semibold">Orders to process</h1><p className="text-muted">Open an order to apply its next permitted lifecycle step or book a shipment.</p></div>
    {orders.items.length ? <ul className="divide-y divide-border rounded-card border border-border bg-surface">{orders.items.map((order) => <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-medium">{order.orderNumber}</p><p className="text-sm text-muted">{order.status} · {order.lines.length} line{order.lines.length === 1 ? "" : "s"}</p></div><Link className="text-sm font-medium text-action hover:underline" href={`/staff/orders/${order.id}`}>Process order</Link></li>)}</ul> : <p className="rounded-card border border-border bg-surface p-6 text-muted">No placed orders need processing.</p>}
  </main>;
}
