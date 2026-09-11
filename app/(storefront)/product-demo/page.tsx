import { formatMoney } from "@/lib/api";
import { asProductId, getProduct } from "@/features/catalog/server/queries";

// Sprint 1 walking-skeleton demo (Gate G0 #1–#3) — not a real screen. Proves
// the one fetch client + Zod boundary parsing against a live (mocked)
// getProduct call. Remove once a real features/catalog product route exists.
const DEMO_PRODUCT_ID = asProductId("018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12");

// Explicit, not inferred: this call needs ECP_API_BASE_URL and a reachable
// backend, neither available at `next build` time — force-dynamic keeps the
// route from being statically prerendered.
export const dynamic = "force-dynamic";

export default async function ProductDemoPage() {
  const product = await getProduct(DEMO_PRODUCT_ID);
  const firstVariant = product.variants[0];

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold text-primary">{product.name}</h1>
      <p className="text-neutral-700">Status: {product.publicationStatus}</p>
      {firstVariant ? (
        <p className="text-neutral-700">{formatMoney(firstVariant.listPrice)}</p>
      ) : null}
    </main>
  );
}
