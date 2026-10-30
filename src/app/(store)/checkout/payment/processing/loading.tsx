import { PageShell } from "@/components/layout";
import { LoadingSkeleton } from "@/components/ui";

export default function PaymentProcessingLoading() {
  return (
    <PageShell title="Checking your payment">
      <LoadingSkeleton shape="card" count={1} />
    </PageShell>
  );
}
