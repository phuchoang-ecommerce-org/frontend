import { PageShell } from "@/components/layout";
import { EmptyState } from "@/components/ui";

export default function OrderNotFound() {
  return (
    <PageShell title="Order not found">
      <EmptyState
        title="We couldn't find that order"
        message="It may not exist or may not belong to this account."
        actionLabel="View your orders"
        actionHref="/account/orders"
      />
    </PageShell>
  );
}
