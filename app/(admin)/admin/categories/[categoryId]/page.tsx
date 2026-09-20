import { AdminCategoryDetailScreen } from "@/features/administration/components/category-detail-screen";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminCategoryDetailPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  return <AdminCategoryDetailScreen params={params} />;
}
