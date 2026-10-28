import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout";
import { ErrorState } from "@/components/ui";
import { InventoryWorkspace } from "@/features/inventory/components";
import { adjustStockAction } from "@/features/inventory/server/actions";
import { listInventoryStock } from "@/lib/api/inventory";
import { getSession } from "@/lib/session";
import { canAdjustInventory, canReadInventory } from "@/lib/session/roles";

export const metadata: Metadata = { title: "Inventory | ECP" };

export default async function StaffInventoryPage() {
  const session = await getSession();
  if (!session || !canReadInventory(session.account.roles)) notFound();
  let stock;
  try {
    stock = await listInventoryStock(session.accessToken);
  } catch {
    return (
      <PageShell title="Inventory">
        <ErrorState
          title="Inventory could not be loaded"
          message="The inventory service is unavailable. Try the page again."
          actionLabel="Try again"
          actionHref="/staff/inventory"
        />
      </PageShell>
    );
  }
  const items = stock.map((item) => ({
    id: item.id,
    sku: item.sku,
    warehouse: item.warehouseCode || item.warehouseId,
    onHand: item.quantityOnHand,
    reserved: item.quantityReserved,
    available: item.availableQuantity,
    ...(item.updatedAt ? { updatedAt: item.updatedAt } : {}),
  }));
  return (
    <PageShell title="Inventory">
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Inventory is authoritative for stock. Available is on hand minus reserved; customer availability is never a warehouse quantity.
      </p>
      <InventoryWorkspace
        items={items}
        canAdjust={canAdjustInventory(session.account.roles)}
        onAdjust={adjustStockAction}
      />
    </PageShell>
  );
}
