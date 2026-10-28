import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout";
import { Card } from "@/components/ui";
import { ProductCreateForm } from "@/features/catalog/components";
import { createProductAction } from "@/features/catalog/server/actions";
import { getSession } from "@/lib/session";
import { canWriteCatalog } from "@/lib/session/roles";

export const metadata: Metadata = { title: "Create product | ECP" };

export default async function NewProductPage() {
  const session = await getSession();
  if (!session || !canWriteCatalog(session.account.roles)) notFound();
  return (
    <PageShell title="Create product">
      <div className="max-w-2xl">
        <Card title="Draft details">
          <ProductCreateForm onCreate={createProductAction} />
        </Card>
      </div>
    </PageShell>
  );
}
