import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  categoryHref,
  parseCategorySearchParams,
  type CategorySearchParams,
} from "../url/category";
import {
  findCategoryBySlugPath,
  getCategory,
  listCategories,
  listCategoryProducts,
  type CatalogSort,
} from "../server/queries";
import { CategoryNavigation } from "./category-navigation";
import { FacetPanelSkeleton, ProductGridSkeleton } from "./catalog-skeletons";
import { ProductGrid } from "./product-grid";

async function resolveCategory(slug: string[]) {
  const tree = await listCategories();
  const matchingNode = findCategoryBySlugPath(tree, slug);
  if (!matchingNode) notFound();
  const category = await getCategory(matchingNode.id, matchingNode.slug);
  return { tree, category };
}

async function Breadcrumbs({ slug }: { slug: string[] }) {
  const { category } = await resolveCategory(slug);
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-neutral-700">
        <ol className="flex flex-wrap gap-1" role="list">
          <li>
            <Link href="/" className="underline-offset-4 hover:underline">
              Catalog
            </Link>
          </li>
          {category.ancestors?.map((ancestor) => (
            <li key={ancestor.id}>/ {ancestor.name}</li>
          ))}
          <li aria-current="page">/ {category.name}</li>
        </ol>
      </nav>
      <h1 className="mt-2 text-2xl font-semibold text-primary">
        {category.name}
      </h1>
    </>
  );
}

async function FacetPanel({
  slug,
  sort,
}: {
  slug: string[];
  sort?: CatalogSort;
}) {
  await resolveCategory(slug);
  return (
    <aside
      className="rounded-card border border-border bg-surface p-2"
      aria-label="Catalog controls"
    >
      <h2 className="text-sm font-medium text-primary">Sort products</h2>
      <form action={categoryHref(slug)} className="mt-2">
        <label className="block text-sm text-neutral-700" htmlFor="sort">
          Order
        </label>
        <select
          className="mt-1 h-control w-full rounded-control border border-border bg-surface px-2 text-base text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          defaultValue={sort ?? ""}
          id="sort"
          name="sort"
        >
          <option value="">Featured</option>
          <option value="price">Price</option>
          <option value="createdAt">Newest</option>
          <option value="popularity">Popularity</option>
        </select>
        <button
          className="mt-2 h-control w-full rounded-control bg-primary px-3 text-sm font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          type="submit"
        >
          Apply order
        </button>
      </form>
    </aside>
  );
}

async function CategoryProducts({
  slug,
  cursor,
  sort,
}: {
  slug: string[];
  cursor?: string;
  sort?: CatalogSort;
}) {
  const { category } = await resolveCategory(slug);
  const products = await listCategoryProducts(
    category.id,
    slug.at(-1) ?? category.slug,
    {
      ...(cursor ? { cursor } : {}),
      ...(sort ? { sort } : {}),
    },
  );
  return (
    <ProductGrid
      categoryName={category.name}
      products={products}
      nextHref={
        products.next
          ? categoryHref(slug, {
              cursor: products.next,
              ...(sort ? { sort } : {}),
            })
          : undefined
      }
      previousHref={
        cursor ? categoryHref(slug, sort ? { sort } : {}) : undefined
      }
    />
  );
}

export async function CatalogCategoryPage({
  slug,
  searchParams,
}: {
  slug: string[];
  searchParams: CategorySearchParams;
}) {
  const { cursor, sort } = parseCategorySearchParams(searchParams);
  const categories = await listCategories().catch(() => []);

  return (
    <>
      <CategoryNavigation categories={categories} />
      <main className="mx-auto w-full max-w-content px-4 py-6">
        <Suspense fallback={<div className="h-16" />}>
          <Breadcrumbs slug={slug} />
        </Suspense>
        <div className="mt-4 grid gap-4 lg:grid-cols-catalog">
          <Suspense fallback={<FacetPanelSkeleton />}>
            <FacetPanel slug={slug} {...(sort ? { sort } : {})} />
          </Suspense>
          <Suspense fallback={<ProductGridSkeleton />}>
            <CategoryProducts
              slug={slug}
              {...(cursor ? { cursor } : {})}
              {...(sort ? { sort } : {})}
            />
          </Suspense>
        </div>
      </main>
    </>
  );
}
