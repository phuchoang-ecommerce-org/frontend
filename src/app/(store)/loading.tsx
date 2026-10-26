import { PageShell } from "@/components/layout";
import { LoadingSkeleton } from "@/components/ui";

export default function StoreLoading() {
  return <PageShell title="Loading store"><LoadingSkeleton shape="card" count={4} /></PageShell>;
}
