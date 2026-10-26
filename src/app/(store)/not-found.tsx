import { PageShell } from "@/components/layout";
import { EmptyState } from "@/components/ui";

export default function StoreNotFound() {
  return (
    <PageShell title="Not found">
      <EmptyState
        title="We couldn't find that item"
        message="It may no longer be available."
        actionLabel="Browse products"
        actionHref="/products"
      />
    </PageShell>
  );
}
