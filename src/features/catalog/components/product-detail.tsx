import Link from "next/link";
import type { ProductDetailData } from "../types";
import { AddToCartForm } from "./add-to-cart-form";

type AddToCartResult = { ok: true } | { ok: false; error: string };

export function ProductDetail({
  product,
  onAddToCart,
}: {
  product: ProductDetailData;
  onAddToCart: (
    variantId: string,
    quantity: number,
    csrfToken: string,
  ) => Promise<AddToCartResult>;
}) {
  return (
    <article className="grid items-start gap-8 md:grid-cols-2">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-card bg-soft">
        {product.image ? (
          // The API owns catalog image hosts, so this boundary deliberately avoids a fixed Next image allowlist.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image.url}
            alt={product.image.alt}
            className="h-full w-full object-contain"
          />
        ) : (
          <p className="text-sm text-muted-foreground">Image unavailable</p>
        )}
      </div>
      <div className="space-y-5">
        {product.brand && (
          <p className="text-sm font-medium text-muted-foreground">
            {product.brand}
          </p>
        )}
        {product.description && (
          <p className="leading-7 whitespace-pre-wrap">{product.description}</p>
        )}
        <AddToCartForm variants={product.variants} onAdd={onAddToCart} />
        <Link
          href="/cart"
          className="inline-block text-sm font-medium underline underline-offset-4"
        >
          View cart
        </Link>
        {product.categories.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Categories:{" "}
            {product.categories.map((category, index) => (
              <span key={category.id}>
                {index > 0 && ", "}
                <Link
                  href={`/categories/${encodeURIComponent(category.id)}`}
                  className="underline underline-offset-4"
                >
                  {category.name}
                </Link>
              </span>
            ))}
          </p>
        )}
      </div>
    </article>
  );
}
