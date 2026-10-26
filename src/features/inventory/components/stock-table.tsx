import {
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import type { StockItem } from "../types";

export function StockTable({ items }: { items: StockItem[] }) {
  if (!items.length)
    return (
      <EmptyState
        title="No stock records"
        message="Stock will appear here after products and warehouses are configured."
      />
    );
  return (
    <div className="overflow-x-auto">
      <Table caption="Stock by SKU and warehouse">
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Warehouse</TableHead>
            <TableHead className="text-right">Available</TableHead>
            <TableHead className="text-right">Reserved</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.sku}</TableCell>
              <TableCell>{item.productName}</TableCell>
              <TableCell>{item.warehouse}</TableCell>
              <TableCell className="text-right tabular-nums">
                {item.available}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {item.reserved}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
