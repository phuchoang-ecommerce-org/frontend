import "server-only";

import { backendRequest } from "@/lib/api/backend";
import { formatMoney, type Money } from "@/lib/format/money";
import type { Category, Product, Variant } from "../types";

type CategoryWire = { id: string; name: string; children: CategoryWire[] };
type ProductWire = {
  id: string;
  name: string;
  brand?: string;
  description?: string;
  primaryImageUrl?: string;
  priceFrom: Money;
  priceTo: Money;
  inStock: boolean | null;
};
type VariantWire = {
  id: string;
  name: string;
  active: boolean;
  listPrice: Money;
  promotionalPrice: Money;
  availability: { inStock: boolean } | null;
};
type ProductDetailWire = Omit<
  ProductWire,
  "priceFrom" | "priceTo" | "inStock"
> & {
  images: { url: string; altText?: string }[];
  variants: VariantWire[];
};
type PageWire = { items: ProductWire[]; page: { next: string | null } };

function imageUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.hostname === "localhost" && parsed.port === "3000"
      ? parsed.pathname
      : url;
  } catch {
    return url;
  }
}

function categoryView(node: CategoryWire): Category {
  return {
    id: node.id,
    label: node.name,
    href: `/categories/${node.id}`,
    children: node.children?.map(categoryView) ?? [],
  };
}

function productView(item: ProductWire): Product {
  return {
    id: item.id,
    name: item.name,
    href: `/products/${item.id}`,
    imageUrl: imageUrl(item.primaryImageUrl),
    price: formatMoney(item.priceFrom),
    compareAtPrice:
      item.priceTo?.amount !== item.priceFrom?.amount
        ? formatMoney(item.priceTo)
        : undefined,
    availability:
      item.inStock === null
        ? "unknown"
        : item.inStock
          ? "available"
          : "unavailable",
  };
}

export async function getCategories(): Promise<Category[]> {
  const response = await backendRequest("/categories");
  if (!response.ok) throw new Error("Categories could not be loaded");
  return ((await response.json()) as CategoryWire[]).map(categoryView);
}

export async function getProducts(categoryId?: string): Promise<Product[]> {
  if (categoryId) {
    const response = await backendRequest(
      `/categories/${encodeURIComponent(categoryId)}/products?size=100`,
    );
    if (!response.ok) throw new Error("Products could not be loaded");
    return ((await response.json()) as PageWire).items.map(productView);
  }

  const categoryResponse = await backendRequest("/categories");
  if (!categoryResponse.ok) throw new Error("Products could not be loaded");
  const roots = (await categoryResponse.json()) as CategoryWire[];
  const allCategories = (nodes: CategoryWire[]): CategoryWire[] =>
    nodes.flatMap((node) => [node, ...allCategories(node.children ?? [])]);
  const responses = await Promise.all(
    allCategories(roots).map((category) =>
      backendRequest(
        `/categories/${encodeURIComponent(category.id)}/products?size=100`,
      ),
    ),
  );
  if (responses.some((response) => !response.ok))
    throw new Error("Products could not be loaded");
  const pages = await Promise.all(
    responses.map((response) => response.json() as Promise<PageWire>),
  );
  const unique = new Map<string, ProductWire>();
  for (const page of pages)
    for (const item of page.items) unique.set(item.id, item);
  return [...unique.values()].map(productView);
}

export async function getCategory(
  categoryId: string,
): Promise<{ id: string; name: string } | null> {
  const response = await backendRequest(
    `/categories/${encodeURIComponent(categoryId)}`,
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Category could not be loaded");
  return (await response.json()) as { id: string; name: string };
}

export async function getProduct(productId: string): Promise<{
  id: string;
  name: string;
  brand?: string;
  description?: string;
  image?: { url: string; alt: string };
  variants: (Variant & {
    price: string;
    availability: "available" | "unavailable" | "unknown";
  })[];
} | null> {
  const response = await backendRequest(
    `/products/${encodeURIComponent(productId)}`,
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Product could not be loaded");
  const item = (await response.json()) as ProductDetailWire;
  return {
    id: item.id,
    name: item.name,
    brand: item.brand,
    description: item.description,
    image: item.images?.[0]
      ? {
          url: imageUrl(item.images[0].url) ?? item.images[0].url,
          alt: item.images[0].altText || item.name,
        }
      : undefined,
    variants: item.variants
      .filter((variant) => variant.active)
      .map((variant) => ({
        id: variant.id,
        label: variant.name,
        available: variant.availability?.inStock !== false,
        availability:
          variant.availability == null
            ? "unknown"
            : variant.availability.inStock
              ? "available"
              : "unavailable",
        price: formatMoney(variant.promotionalPrice ?? variant.listPrice),
      })),
  };
}
