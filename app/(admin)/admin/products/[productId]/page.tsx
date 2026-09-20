import { AdminProductDetailScreen } from "@/features/administration/components/product-detail-screen";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  return <AdminProductDetailScreen params={params} />;
}
