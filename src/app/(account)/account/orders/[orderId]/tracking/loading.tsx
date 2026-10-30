import { PageShell } from "@/components/layout";
import { LoadingSkeleton } from "@/components/ui";

export default function OrderTrackingLoading() {
  return (
    <PageShell title="Shipment tracking">
      <LoadingSkeleton shape="card" count={2} />
    </PageShell>
  );
}
