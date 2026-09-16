import { notFound } from "next/navigation";

import { ApiProblem } from "@/lib/api";
import {
  CategoryEditor,
  DeleteCategoryControl,
} from "@/features/administration/components/category-forms";
import { CategoryProducts } from "@/features/administration/components/category-products";
import {
  getAdminCategory,
  listAdminCategoryProducts,
  listAdminCategories,
} from "@/features/administration/server/queries";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminCategoryDetailPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  let category: Awaited<ReturnType<typeof getAdminCategory>>;
  let categories: Awaited<ReturnType<typeof listAdminCategories>>;
  let products: Awaited<ReturnType<typeof listAdminCategoryProducts>>;
  try {
    [category, categories, products] = await Promise.all([
      getAdminCategory(categoryId),
      listAdminCategories(),
      listAdminCategoryProducts(categoryId),
    ]);
  } catch (error) {
    if (error instanceof ApiProblem && error.problem.status === 404) notFound();
    throw error;
  }
  return (
    <div className="flex flex-col gap-4">
      <CategoryEditor category={category} categories={categories} />
      <CategoryProducts products={products.items} />
      <DeleteCategoryControl categoryId={category.id} />
    </div>
  );
}
