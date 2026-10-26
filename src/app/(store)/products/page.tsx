import type { Metadata } from "next";
import { PageShell } from "@/components/layout";
import { CategoryTree, ProductGrid } from "@/features/catalog/components";
import { getCategories, getProducts } from "@/features/catalog/server/queries";

export const metadata: Metadata = { title: "Products | ECP" };

export default async function ProductsPage() {
  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);
  return (
    <PageShell title="Products">
      <div className="grid items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <CategoryTree categories={categories} />
        <section aria-label="Products" className="min-w-0 space-y-6">
          <ProductGrid products={result.products} />
        </section>
      </div>
    </PageShell>
  );
}
