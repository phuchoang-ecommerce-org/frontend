import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, PageShell } from "@/components/layout";
import {
  CatalogPagination,
  CategoryTree,
  ProductGrid,
} from "@/features/catalog/components";
import {
  readCursorPage,
  type CursorSearchParams,
} from "@/features/catalog/pagination";
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
  searchParams: Promise<CursorSearchParams>;
}) {
  const [{ categoryId }, query] = await Promise.all([params, searchParams]);
  const page = readCursorPage(query);
  const [category, categories, result] = await Promise.all([
    getCategory(categoryId),
    getCategories(),
    getCategoryProducts(categoryId, page.cursor),
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
          <CatalogPagination
            basePath={`/categories/${encodeURIComponent(categoryId)}`}
            page={page}
            nextCursor={result.nextCursor}
          />
        </section>
      </div>
    </PageShell>
  );
}
