import { PageShell } from "@/components/layout";
import { LoadingSkeleton } from "@/components/ui";

export default function CartLoading() {
  return (
    <PageShell title="Your cart">
      <div className="grid items-start gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2"><LoadingSkeleton shape="row" count={4} /></div>
        <LoadingSkeleton shape="card" />
      </div>
    </PageShell>
  );
}
