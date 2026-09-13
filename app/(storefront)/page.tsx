import { CategoryNavigation } from "@/features/catalog/components/category-navigation";
import { listCategories } from "@/features/catalog/server/queries";

export default async function Home() {
  // A tree outage must not remove the search and storefront shell (UC-CAT-01 E2).
  const categories = await listCategories().catch(() => []);
  return (
    <>
      <CategoryNavigation categories={categories} />
      <section className="mx-auto w-full max-w-content px-4 py-8">
        <p className="text-sm font-medium text-accent">Catalog</p>
        <h1 className="mt-1 text-2xl font-semibold text-primary">
          Browse by category
        </h1>
        <p className="mt-2 max-w-2xl text-neutral-700">
          Choose a category to explore the current collection.
        </p>
      </section>
    </>
  );
}
