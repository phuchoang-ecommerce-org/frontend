import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout";
import { ErrorState } from "@/components/ui";
import { StaffCatalogList } from "@/features/catalog/components";
import { listAdminProducts } from "@/lib/api/catalog-admin";
import { getSession } from "@/lib/session";
import { canWriteCatalog } from "@/lib/session/roles";

export const metadata: Metadata = { title: "Catalog management | ECP" };

export default async function StaffCatalogPage() {
  const session = await getSession();
  if (!session || !canWriteCatalog(session.account.roles)) notFound();
  let products;
  try {
    products = await listAdminProducts(session.accessToken);
  } catch {
    return (
      <PageShell title="Catalog">
        <ErrorState
          title="Catalog could not be loaded"
          message="The catalog service is unavailable. Try the page again."
          actionLabel="Try again"
          actionHref="/staff/catalog"
        />
      </PageShell>
    );
  }
  return (
    <PageShell
      title="Catalog"
      actions={
        <Link
          href="/staff/catalog/products/new"
          className="inline-flex min-h-control items-center rounded-control bg-primary px-3 text-sm font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Create product
        </Link>
      }
    >
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Create a draft, add its SKU and price, then publish when it is ready for
        storefront browse.
      </p>
      <StaffCatalogList products={products} />
    </PageShell>
  );
}
