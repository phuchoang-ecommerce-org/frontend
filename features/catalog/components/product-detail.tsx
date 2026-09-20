/* eslint-disable @next/next/no-img-element -- Product image URLs are contract-provided remote media; deployment config owns CDN optimisation. */

import { Suspense } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { SectionEmpty, SectionSkeleton } from "@/components/ui/section-state";
import { formatMoney, type ProductId } from "@/lib/api";

import type { CategoryRef, Product, Variant } from "../schema/product";
import { listProductVariants } from "../server/queries";
import { VariantSelector } from "./variant-selector";

function promotionPeriod(variant: Variant) {
  if (!variant.promotionalPrice || !variant.activePromotion) return null;
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return `${formatter.format(new Date(variant.activePromotion.validFrom))} – ${formatter.format(
    new Date(variant.activePromotion.validUntil),
  )}`;
}

export function ProductPrimary({ product }: { product: Product }) {
  const firstVariant = product.variants.find((variant) => variant.active);
  const category = product.categories[0];
  const promotionalPrice = firstVariant?.promotionalPrice;
  const activePromotionPeriod = firstVariant
    ? promotionPeriod(firstVariant)
    : null;

  return (
    <section className="grid gap-4 lg:grid-cols-product-detail">
      <div className="rounded-card border border-border bg-surface p-4">
        {product.images[0] ? (
          <img
            alt={product.images[0].altText ?? product.name}
            className="aspect-square w-full rounded-control object-cover"
            src={product.images[0].url}
          />
        ) : (
          <div className="flex aspect-square items-center justify-center rounded-control bg-neutral-100 p-4 text-center text-sm text-neutral-700">
            Product image unavailable
          </div>
        )}
      </div>
      <div className="rounded-card border border-border bg-surface p-4">
        {category ? (
          <p className="text-sm font-medium text-accent">{category.name}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold text-primary">
          {product.name}
        </h1>
        {product.brand ? (
          <p className="mt-1 text-sm text-neutral-700">{product.brand}</p>
        ) : null}
        {promotionalPrice ? (
          <div className="mt-4">
            <p className="text-xl font-semibold text-primary">
              {formatMoney(promotionalPrice)}
            </p>
            {firstVariant ? (
              <p className="text-sm text-neutral-700 line-through">
                {formatMoney(firstVariant.listPrice)}
              </p>
            ) : null}
            {activePromotionPeriod ? (
              <p className="mt-1 text-sm text-neutral-700">
                Offer active {activePromotionPeriod}
              </p>
            ) : null}
          </div>
        ) : firstVariant ? (
          <p className="mt-4 text-xl font-semibold text-primary">
            {formatMoney(firstVariant.listPrice)}
          </p>
        ) : (
          <p className="mt-4 text-sm text-neutral-700">
            Price currently unavailable
          </p>
        )}
        {product.description ? (
          <p className="mt-4 text-neutral-700">{product.description}</p>
        ) : null}
        <Suspense fallback={<SectionSkeleton className="mt-4" lines={2} />}>
          <VariantSelector variants={product.variants} />
        </Suspense>
      </div>
    </section>
  );
}

export async function AvailabilitySection({
  productId,
}: {
  productId: ProductId;
}) {
  const variants = await listProductVariants(productId).catch(() => null);
  if (!variants) {
    return (
      <SectionEmpty
        description="Availability is temporarily unavailable. Check again when you are ready to order."
        title="Availability is advisory"
      />
    );
  }
  const available = variants.filter(
    (variant) => variant.active && variant.availability?.inStock !== false,
  ).length;
  return (
    <section
      className="rounded-card border border-border bg-surface p-4"
      aria-labelledby="availability-heading"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2
          id="availability-heading"
          className="text-base font-medium text-primary"
        >
          Availability
        </h2>
        <Badge variant="outline">Advisory</Badge>
      </div>
      <p className="mt-2 text-sm text-neutral-700">
        {available > 0
          ? `${available} option${available === 1 ? " is" : "s are"} currently available.`
          : "No options are currently available."}{" "}
        The final check happens when you place an order.
      </p>
    </section>
  );
}

export function ProductUnavailable({ category }: { category: CategoryRef }) {
  return (
    <main className="py-16 mx-auto w-full max-w-content px-4 text-center">
      <h1 className="text-2xl font-semibold text-primary">
        This product is unavailable
      </h1>
      <p className="mt-2 text-neutral-700">
        Browse the category it belonged to for other options.
      </p>
      <Link
        className="mt-4 inline-flex min-h-control items-center rounded-control bg-primary px-3 text-sm font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        href={`/c/${encodeURIComponent(category.slug)}`}
      >
        Browse {category.name}
      </Link>
    </main>
  );
}
