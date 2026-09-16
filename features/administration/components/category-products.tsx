import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { AdminProductSummary } from "../schema/catalog";

export function CategoryProducts({
  products,
}: {
  products: AdminProductSummary[];
}) {
  return (
    <section className="p-5 max-w-3xl rounded-card border border-border bg-surface">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-primary">
          Assigned products
        </h2>
        <p className="text-sm text-neutral-700">
          Reassign these products before removing this category.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Link
                  href={`/admin/products/${product.id}`}
                  className="font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {product.name}
                </Link>
              </TableCell>
              <TableCell>{product.publicationStatus}</TableCell>
            </TableRow>
          ))}
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2}>
                No products are assigned to this category.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </section>
  );
}
