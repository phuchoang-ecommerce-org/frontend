import { PageShell } from "@/components/layout";
import { LoadingSkeleton } from "@/components/ui";

export default function AddressesLoading() {
  return (
    <PageShell title="Shipping addresses">
      <div className="grid gap-4 md:grid-cols-2">
        <LoadingSkeleton shape="card" count={4} />
      </div>
    </PageShell>
  );
}
