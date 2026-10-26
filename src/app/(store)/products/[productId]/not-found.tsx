import { PageShell } from "@/components/layout";
import { EmptyState } from "@/components/ui";

export default function ProductNotFound() {
  return (
    <PageShell title="Product not found">
      <EmptyState
        title="This product does not exist"
        message="It may have been removed or is no longer available."
        actionLabel="Browse products"
        actionHref="/products"
      />
    </PageShell>
  );
}
