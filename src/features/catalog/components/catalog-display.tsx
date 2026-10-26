import Image from "next/image";
import Link from "next/link";
import { Badge, Card, EmptyState } from "@/components/ui";
import { focusRing } from "@/components/ui/styles";
import type { Category, Product } from "../types";

export function PriceDisplay({
  price,
  compareAtPrice,
}: {
  price: string;
  compareAtPrice?: string;
}) {
  return (
    <p className="flex flex-wrap items-baseline gap-2 tabular-nums">
      <span className="font-semibold">{price}</span>
      {compareAtPrice && (
        <del
          className="text-sm text-muted-foreground"
          aria-label={`Previous price ${compareAtPrice}`}
        >
          {compareAtPrice}
        </del>
      )}
    </p>
  );
}

export function AvailabilityLabel({
  availability,
  text,
}: {
  availability: Product["availability"];
  text?: string;
}) {
  const label =
    text ??
    (availability === "available"
      ? "Available"
      : availability === "unavailable"
        ? "Out of stock"
        : "Availability unknown");
  return (
    <Badge
      label={label}
      kind={
        availability === "available"
          ? "success"
          : availability === "unavailable"
            ? "error"
            : "info"
      }
    />
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="overflow-hidden rounded-card border border-border bg-surface">
      <Link
        href={product.href}
        className={`block rounded-control ${focusRing}`}
      >
        <div className="relative aspect-square bg-soft">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.imageAlt ?? product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
              Image unavailable
            </span>
          )}
        </div>
        <div className="space-y-2 p-4">
          <h3 className="font-medium leading-snug">{product.name}</h3>
          <PriceDisplay
            price={product.price}
            compareAtPrice={product.compareAtPrice}
          />
          <AvailabilityLabel
            availability={product.availability}
            text={product.availabilityText}
          />
        </div>
      </Link>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length)
    return (
      <EmptyState
        title="No products found"
        message="Try another category or search term."
        actionLabel="Browse products"
        actionHref="/products"
      />
    );
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function CategoryNodes({ categories }: { categories: Category[] }) {
  return (
    <ul className="space-y-1">
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            href={category.href}
            className={`inline-flex min-h-control items-center rounded-control px-2 text-sm hover:bg-soft ${focusRing}`}
          >
            {category.label}
          </Link>
          {category.children?.length ? (
            <div className="ms-4 border-s border-border ps-2">
              <CategoryNodes categories={category.children} />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function CategoryTree({ categories }: { categories: Category[] }) {
  return (
    <nav aria-label="Product categories">
      <Card title="Categories">
        {categories.length ? (
          <CategoryNodes categories={categories} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No categories available.
          </p>
        )}
      </Card>
    </nav>
  );
}
