import { InventoryAdjustments } from "@/features/inventory/components/inventory-adjustments";
import { listMockStockAdjustments } from "@/features/inventory/server/inventory-mock";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminInventoryPage() {
  return <InventoryAdjustments snapshot={listMockStockAdjustments()} />;
}
