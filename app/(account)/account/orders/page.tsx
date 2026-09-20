import { OrdersPage } from "@/features/ordering/components/orders-page";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AccountOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  return <OrdersPage searchParams={await searchParams} />;
}
