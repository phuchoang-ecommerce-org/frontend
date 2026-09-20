import type { ProductId } from "@/lib/api";

import { SectionEmpty } from "@/components/ui/section-state";

import { getProductRatingSummary, listProductReviews } from "../server/queries";

export async function ProductReviewsSection({
  productId,
}: {
  productId: ProductId;
}) {
  const result = await Promise.all([
    getProductRatingSummary(productId),
    listProductReviews(productId),
  ]).catch(() => null);
  if (!result) {
    return (
      <SectionEmpty
        description="Reviews are unavailable right now. Product details and options are still available."
        title="Reviews unavailable"
      />
    );
  }
  const [summary, reviews] = result;
  return (
    <section
      className="rounded-card border border-border bg-surface p-4"
      aria-labelledby="reviews-heading"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="reviews-heading" className="text-base font-medium text-primary">
          Reviews
        </h2>
        <p className="text-sm text-neutral-700">
          {summary.averageRating
            ? `${summary.averageRating.toFixed(1)} / 5`
            : "No rating yet"}{" "}
          · {summary.reviewCount} reviews
        </p>
      </div>
      {reviews.length ? (
        <ul className="mt-3 space-y-3" role="list">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="first:pt-0 border-t border-border pt-3 first:border-0"
            >
              <p className="text-sm font-medium text-primary">
                {review.title ?? `${review.rating} out of 5`}
              </p>
              {review.body ? (
                <p className="mt-1 text-sm text-neutral-700">{review.body}</p>
              ) : null}
              <p className="mt-1 text-sm text-neutral-700">
                {review.authorDisplayName ?? "Verified shopper"}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-neutral-700">No reviews yet.</p>
      )}
    </section>
  );
}
