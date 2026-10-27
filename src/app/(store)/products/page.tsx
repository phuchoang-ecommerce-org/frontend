import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout";
import { CategoryTree, ProductGrid } from "@/features/catalog/components";
import { getCategories, getProducts } from "@/features/catalog/server/queries";

export const metadata: Metadata = { title: "Products | ECP" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string | string[] }>;
}) {
  const query = await searchParams;
  const cursor = typeof query.cursor === "string" ? query.cursor : undefined;
  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts(cursor),
  ]);
  return (
    <PageShell title="Products">
      <div className="grid items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <CategoryTree categories={categories} />
        <section aria-label="Products" className="min-w-0 space-y-6">
          <ProductGrid products={result.products} />
          {result.nextCursor && (
            <Link
              href={`/products?cursor=${encodeURIComponent(result.nextCursor)}`}
              className="inline-flex min-h-control items-center rounded-control border border-border px-4 text-sm font-medium hover:bg-soft focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Next products
            </Link>
          )}
        </section>
      </div>
    </PageShell>
  );
}
