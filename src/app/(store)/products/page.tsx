import type { Metadata } from "next";
import { PageShell } from "@/components/layout";
import { CategoryTree, ProductGrid } from "@/features/catalog/components";
import { getCategories, getProducts } from "@/features/catalog/server/queries";

export const metadata: Metadata = { title: "Products | ECP" };

export default async function ProductsPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <PageShell title="Products">
      <div className="grid items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <CategoryTree categories={categories} />
        <section aria-label="Products" className="min-w-0">
          <ProductGrid products={products} />
        </section>
      </div>
    </PageShell>
  );
}
