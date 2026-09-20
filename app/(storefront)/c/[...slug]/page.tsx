import { CatalogCategoryPage } from "@/features/catalog/components/category-page";
import {
  categorySlugPaths,
  listCategories,
} from "@/features/catalog/server/queries";

type CategoryPageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ cursor?: string; sort?: string }>;
};

export async function generateStaticParams() {
  try {
    return categorySlugPaths(await listCategories()).map((slug) => ({ slug }));
  } catch {
    // A deploy can still serve an on-demand category if its source is unavailable at build time.
    return [];
  }
}

export const dynamicParams = true;

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return <CatalogCategoryPage slug={slug} searchParams={query} />;
}
