import Link from "next/link";

import { formatMoney, type ProductId } from "@/lib/api";

import type { Recommendation } from "../schema/recommendation";
import { listRelatedProducts } from "../server/queries";

function RecommendationRail({ products }: { products: Recommendation[] }) {
  if (!products.length) return null;
  return (
    <section aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-lg font-semibold text-primary">
        Related products
      </h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" role="list">
        {products.map((product) => (
          <li key={product.id}>
            <Link
              className="duration-elevate block rounded-card border border-border bg-surface p-3 transition-shadow hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              href={`/p/${product.id}`}
            >
              <p className="font-medium text-primary">{product.name}</p>
              {product.priceFrom ? (
                <p className="mt-1 text-sm text-neutral-700">
                  {formatMoney(product.priceFrom)}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export async function ProductRecommendationsSection({
  productId,
}: {
  productId: ProductId;
}) {
  const products = await listRelatedProducts(productId).catch(() => null);
  return products ? <RecommendationRail products={products} /> : null;
}
