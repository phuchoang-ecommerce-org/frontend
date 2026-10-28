import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, PageShell } from "@/components/layout";
import { ErrorState } from "@/components/ui";
import { ProductWorkspace } from "@/features/catalog/components";
import {
  addVariantAction,
  changeVariantPriceAction,
  publishProductAction,
} from "@/features/catalog/server/actions";
import { getAdminProduct } from "@/lib/api/catalog-admin";
import { getSession } from "@/lib/session";
import { canWriteCatalog } from "@/lib/session/roles";

export const metadata: Metadata = { title: "Manage product | ECP" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const session = await getSession();
  if (!session || !canWriteCatalog(session.account.roles)) notFound();
  const { productId } = await params;
  let product;
  try {
    product = await getAdminProduct(session.accessToken, productId);
  } catch {
    return (
      <PageShell title="Manage product">
        <ErrorState
          title="Product could not be loaded"
          message="The catalog service is unavailable. Try the page again."
          actionLabel="Return to catalog"
          actionHref="/staff/catalog"
        />
      </PageShell>
    );
  }
  if (!product) notFound();
  return (
    <PageShell title={product.name}>
      <div className="mb-5">
        <Breadcrumbs
          items={[
            { label: "Catalog", href: "/staff/catalog" },
            { label: product.name, href: `/staff/catalog/products/${encodeURIComponent(product.id)}/edit` },
          ]}
        />
      </div>
      <ProductWorkspace
        product={product}
        onAddVariant={addVariantAction}
        onPublish={publishProductAction}
        onChangePrice={changeVariantPriceAction}
      />
    </PageShell>
  );
}
