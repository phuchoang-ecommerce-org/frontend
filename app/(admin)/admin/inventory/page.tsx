import { InventoryAdjustments } from "@/features/administration/components/inventory-adjustments";
import { listMockStockAdjustments } from "@/features/administration/server/inventory-mock";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminInventoryPage() {
  return <InventoryAdjustments snapshot={listMockStockAdjustments()} />;
}
