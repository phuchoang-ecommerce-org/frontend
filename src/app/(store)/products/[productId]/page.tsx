import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell, Breadcrumbs } from "@/components/layout";
import { ProductDetail } from "@/features/catalog/components";
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
      <ProductDetail product={product} onAddToCart={addToCartAction} />
    </PageShell>
  );
}
