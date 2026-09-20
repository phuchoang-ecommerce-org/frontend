import { Suspense } from "react";

import { ApiProblem } from "@/lib/api";
import { ProductReviewsSection } from "@/features/review/components/product-reviews-section";
import { ProductRecommendationsSection } from "@/features/search/components/product-recommendations-section";
import {
  AvailabilitySection,
  ProductPrimary,
  ProductUnavailable,
} from "@/features/catalog/components/product-detail";
import { asProductId, getProduct } from "@/features/catalog/server/queries";

import { SectionSkeleton } from "@/components/ui/section-state";

export const revalidate = 3600;
export const dynamicParams = true;

async function readProduct(productId: ReturnType<typeof asProductId>) {
  try {
    return { product: await getProduct(productId) } as const;
  } catch (error) {
    if (error instanceof ApiProblem && error.problem.recovery?.category) {
      return { recovery: error.problem.recovery.category } as const;
    }
    throw error;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId: rawProductId } = await params;
  const productId = asProductId(rawProductId);

  // This is intentionally the only page-fatal read. The remaining three
  // sections own their errors and stream independently below.
  const result = await readProduct(productId);
  if ("recovery" in result)
    return <ProductUnavailable category={result.recovery} />;

  return (
    <main className="mx-auto w-full max-w-content px-4 py-6">
      <ProductPrimary product={result.product} />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<SectionSkeleton />}>
          <AvailabilitySection productId={productId} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <ProductReviewsSection productId={productId} />
        </Suspense>
      </div>
      <div className="mt-6">
        <Suspense fallback={<SectionSkeleton lines={2} />}>
          <ProductRecommendationsSection productId={productId} />
        </Suspense>
      </div>
    </main>
  );
}
