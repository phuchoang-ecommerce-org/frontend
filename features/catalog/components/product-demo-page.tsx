import { formatMoney } from "@/lib/api";

import { asProductId, getProduct } from "../server/queries";

const DEMO_PRODUCT_ID = asProductId("018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12");

export async function ProductDemoPage() {
  const product = await getProduct(DEMO_PRODUCT_ID);
  const firstVariant = product.variants[0];

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold text-primary">{product.name}</h1>
      <p className="text-neutral-700">Status: {product.publicationStatus}</p>
      {firstVariant ? (
        <p className="text-neutral-700">
          {formatMoney(firstVariant.listPrice)}
        </p>
      ) : null}
    </main>
  );
}
