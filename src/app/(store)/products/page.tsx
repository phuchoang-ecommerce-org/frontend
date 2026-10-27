import type { Metadata } from "next";
import { PageShell } from "@/components/layout";
import {
  CatalogPagination,
  CategoryTree,
  ProductGrid,
} from "@/features/catalog/components";
import {
  readCursorPage,
  type CursorSearchParams,
} from "@/features/catalog/pagination";
import { getCategories, getProducts } from "@/features/catalog/server/queries";

export const metadata: Metadata = { title: "Products | ECP" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<CursorSearchParams>;
}) {
  const query = await searchParams;
  const page = readCursorPage(query);
  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts(page.cursor),
  ]);
  return (
    <PageShell title="Products">
      <div className="grid items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <CategoryTree categories={categories} />
        <section aria-label="Products" className="min-w-0 space-y-6">
          <ProductGrid products={result.products} />
          <CatalogPagination
            basePath="/products"
            page={page}
            nextCursor={result.nextCursor}
          />
        </section>
      </div>
    </PageShell>
  );
}
