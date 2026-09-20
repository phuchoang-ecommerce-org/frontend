import { ProductDemoPage } from "@/features/catalog/components/product-demo-page";

// Sprint 1 walking-skeleton demo (Gate G0 #1–#3) — not a real screen. Proves
// the one fetch client + Zod boundary parsing against a live (mocked)
// getProduct call. Remove once a real features/catalog product route exists.
// Explicit, not inferred: this call needs ECP_API_BASE_URL and a reachable
// backend, neither available at `next build` time — force-dynamic keeps the
// route from being statically prerendered.
export const dynamic = "force-dynamic";

export default function ProductDemoRoute() {
  return <ProductDemoPage />;
}
