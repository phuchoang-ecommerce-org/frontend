import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, PageShell } from "@/components/layout";
import { CategoryTree, ProductGrid } from "@/features/catalog/components";
import { getCategories, getCategory, getProducts } from "@/features/catalog/server/queries";

export const metadata: Metadata = { title: "Category | ECP" };

export default async function CategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  const category = await getCategory(categoryId);
  if (!category) notFound();
  const [categories, products] = await Promise.all([getCategories(), getProducts(categoryId)]);
  return (
    <PageShell title={category.name}>
      <div className="mb-5"><Breadcrumbs items={[{ label: "Products", href: "/products" }, { label: category.name, href: `/categories/${categoryId}` }]} /></div>
      <div className="grid items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <CategoryTree categories={categories} />
        <section aria-label={`${category.name} products`} className="min-w-0"><ProductGrid products={products} /></section>
      </div>
    </PageShell>
  );
}
