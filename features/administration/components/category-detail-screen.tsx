import { notFound } from "next/navigation";

import { ApiProblem } from "@/lib/api";

import { CategoryEditor, DeleteCategoryControl } from "./category-forms";
import { CategoryProducts } from "./category-products";
import {
  getAdminCategory,
  listAdminCategories,
  listAdminCategoryProducts,
} from "../server/queries";

export async function AdminCategoryDetailScreen({
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
