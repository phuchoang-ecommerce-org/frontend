import { CategoryList } from "@/features/administration/components/category-forms";
import { listAdminCategories } from "@/features/administration/server/queries";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  return <CategoryList categories={await listAdminCategories()} />;
}
