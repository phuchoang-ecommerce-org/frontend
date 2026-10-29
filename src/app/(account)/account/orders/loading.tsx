import { PageShell } from "@/components/layout";
import { LoadingSkeleton } from "@/components/ui";

export default function OrdersLoading() {
  return <PageShell title="Your orders"><LoadingSkeleton shape="card" count={3} /></PageShell>;
}
