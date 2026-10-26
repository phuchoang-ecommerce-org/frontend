import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, PageShell } from "@/components/layout";
import { CategoryTree, ProductGrid } from "@/features/catalog/components";
import {
  getCategories,
  getCategory,
  getCategoryProducts,
} from "@/features/catalog/server/queries";

export const metadata: Metadata = { title: "Category | ECP" };

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<{ cursor?: string | string[] }>;
}) {
  const [{ categoryId }, query] = await Promise.all([params, searchParams]);
  const cursor = typeof query.cursor === "string" ? query.cursor : undefined;
  const [category, categories, result] = await Promise.all([
    getCategory(categoryId),
    getCategories(),
    getCategoryProducts(categoryId, cursor),
  ]);
  if (!category || !result) notFound();
  return (
    <PageShell title={category.name}>
      <div className="mb-5">
        <Breadcrumbs
          items={[
            { label: "Products", href: "/products" },
            ...category.ancestors.map((ancestor) => ({
              label: ancestor.name,
              href: `/categories/${encodeURIComponent(ancestor.id)}`,
            })),
            {
              label: category.name,
              href: `/categories/${encodeURIComponent(categoryId)}`,
            },
          ]}
        />
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <CategoryTree categories={categories} />
        <section
          aria-label={`${category.name} products`}
          className="min-w-0 space-y-6"
        >
          <ProductGrid products={result.products} />
          {result.nextCursor && (
            <Link
              href={`/categories/${encodeURIComponent(categoryId)}?cursor=${encodeURIComponent(result.nextCursor)}`}
              className="inline-flex min-h-control items-center rounded-control border border-border px-4 text-sm font-medium hover:bg-soft"
            >
              Next products
            </Link>
          )}
        </section>
      </div>
    </PageShell>
  );
}
