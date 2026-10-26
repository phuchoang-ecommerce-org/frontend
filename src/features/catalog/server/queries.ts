import "server-only";

import {
  fetchCategories,
  fetchCategory,
  fetchCategoryProducts,
  fetchProduct,
  fetchProducts,
  type ApiCategory,
  type ApiMoney,
  type ApiProductSummary,
} from "@/lib/api/catalog";
import { formatMoney } from "@/lib/format/money";
import type { Category, Product, ProductDetailData } from "../types";

function imageUrl(url?: string | null): string | undefined {
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

function categoryView(node: ApiCategory): Category {
  return {
    id: node.id,
    label: node.name,
    href: `/categories/${encodeURIComponent(node.id)}`,
    children: node.children?.map(categoryView) ?? [],
  };
}

function sameMoney(left?: ApiMoney | null, right?: ApiMoney | null): boolean {
  return Boolean(
    left &&
      right &&
      left.amount === right.amount &&
      left.currency === right.currency,
  );
}

function productView(item: ApiProductSummary): Product {
  const priceFrom = formatMoney(item.priceFrom ?? null);
  const price =
    item.priceTo && !sameMoney(item.priceFrom, item.priceTo)
      ? `${priceFrom} – ${formatMoney(item.priceTo)}`
      : priceFrom;
  return {
    id: item.id,
    name: item.name,
    href: `/products/${encodeURIComponent(item.id)}`,
    imageUrl: imageUrl(item.primaryImageUrl),
    price,
    availability:
      item.inStock == null
        ? "unknown"
        : item.inStock
          ? "available"
          : "unavailable",
  };
}

export async function getCategories(): Promise<Category[]> {
  return (await fetchCategories()).map(categoryView);
}

export async function getProducts(): Promise<{
  products: Product[];
  nextCursor?: string;
}> {
  const page = await fetchProducts();
  return {
    products: page.items.map(productView),
    ...(page.page.next ? { nextCursor: page.page.next } : {}),
  };
}

export async function getCategory(categoryId: string): Promise<{
  id: string;
  name: string;
  ancestors: { id: string; name: string }[];
} | null> {
  const category = await fetchCategory(categoryId);
  if (!category) return null;
  return {
    id: category.id,
    name: category.name,
    ancestors:
      category.ancestors?.map((ancestor) => ({
        id: ancestor.id,
        name: ancestor.name,
      })) ?? [],
  };
}

export async function getCategoryProducts(
  categoryId: string,
  cursor?: string,
): Promise<{ products: Product[]; nextCursor?: string } | null> {
  const page = await fetchCategoryProducts(categoryId, cursor);
  if (!page) return null;
  return {
    products: page.items.map(productView),
    ...(page.page.next ? { nextCursor: page.page.next } : {}),
  };
}

export async function getProduct(
  productId: string,
): Promise<ProductDetailData | null> {
  const item = await fetchProduct(productId);
  if (!item) return null;
  const image = [...item.images].sort(
    (left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0),
  )[0];
  return {
    id: item.id,
    name: item.name,
    ...(item.brand ? { brand: item.brand } : {}),
    ...(item.description ? { description: item.description } : {}),
    ...(image
      ? {
          image: {
            url: imageUrl(image.url) ?? image.url,
            alt: image.altText || item.name,
          },
        }
      : {}),
    categories: item.categories.map((category) => ({
      id: category.id,
      name: category.name,
    })),
    variants: item.variants
      .filter((variant) => variant.active)
      .map((variant) => ({
        id: variant.id,
        label: variant.name || variant.sku,
        available: variant.availability?.inStock !== false,
        availability:
          variant.availability == null
            ? "unknown"
            : variant.availability.inStock
              ? "available"
              : "unavailable",
        price: formatMoney(variant.promotionalPrice ?? variant.listPrice),
        ...(variant.promotionalPrice
          ? { compareAtPrice: formatMoney(variant.listPrice) }
          : {}),
      })),
  };
}
