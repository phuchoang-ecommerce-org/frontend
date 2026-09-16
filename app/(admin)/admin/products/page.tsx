import { ProductList } from "@/features/administration/components/product-list";
import { listAdminProducts } from "@/features/administration/server/queries";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    cursor?: string;
    publicationStatus?: string;
    categoryId?: string;
  }>;
}) {
  const search = await searchParams;
  const products = await listAdminProducts(search);
  return (
    <ProductList
      products={products.items}
      {...(products.next ? { nextCursor: products.next } : {})}
    />
  );
}
