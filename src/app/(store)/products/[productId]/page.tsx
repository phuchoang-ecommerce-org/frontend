import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell, Breadcrumbs } from "@/components/layout";
import { AddToCartForm } from "@/features/catalog/components";
import { getProduct } from "@/features/catalog/server/queries";
import { addToCartAction } from "@/features/cart/server/actions";

export const metadata: Metadata = { title: "Product | ECP" };

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getProduct(productId);
  if (!product) notFound();
  return (
    <PageShell title={product.name}>
      <div className="mb-5">
        <Breadcrumbs
          items={[
            { label: "Products", href: "/products" },
            { label: product.name, href: `/products/${productId}` },
          ]}
        />
      </div>
      <div className="grid items-start gap-8 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-card bg-soft">
          {product.image ? (
            // Catalog URLs come from the backend; rendering as an ordinary image avoids assuming a fixed host.
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
            <p className="leading-7 whitespace-pre-wrap">
              {product.description}
            </p>
          )}
          <AddToCartForm variants={product.variants} onAdd={addToCartAction} />
          <Link
            href="/cart"
            className="inline-block text-sm font-medium underline underline-offset-4"
          >
            View cart
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
