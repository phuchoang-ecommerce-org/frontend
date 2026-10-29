import { PageShell } from "@/components/layout";
import { LoadingSkeleton } from "@/components/ui";

export default function CheckoutLoading() { return <PageShell title="Checkout"><LoadingSkeleton shape="card" count={3} /></PageShell>; }
