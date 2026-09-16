import { ProductForm } from "@/features/administration/components/product-form";
import { listAdminCategories } from "@/features/administration/server/queries";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewAdminProductPage() {
  const categories = await listAdminCategories();
  return <ProductForm categories={categories} />;
}
