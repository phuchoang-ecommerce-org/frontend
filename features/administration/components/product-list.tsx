"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CsrfField } from "@/components/ui/csrf-field";
import { FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  amendAdminProductsInBulk,
  type AdminActionResult,
} from "@/features/administration/server/actions";
import type { AdminProductSummary } from "@/features/administration/schema/catalog";

const initialState: AdminActionResult = { ok: false };

export function ProductList({
  products,
  nextCursor,
}: {
  products: AdminProductSummary[];
  nextCursor?: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [state, formAction, pending] = useActionState(
    async (
      _previous: AdminActionResult,
      formData: FormData,
    ): Promise<AdminActionResult> => {
      const brand = formData.get("brand");
      const chosen = products.filter((product) => selected.has(product.id));
      if (chosen.length === 0)
        return {
          ok: false,
          formError: "Select at least one product to amend.",
        };
      const result = await amendAdminProductsInBulk({
        csrfToken: formData.get("csrfToken"),
        items: chosen.map((product) => ({
          productId: product.id,
          amendment: {
            name: product.name,
            ...(typeof brand === "string" && brand.trim()
              ? { brand: brand.trim() }
              : {}),
          },
        })),
      });
      if (result.ok) {
        setSelected(new Set());
        router.refresh();
      }
      return result;
    },
    initialState,
  );

  function toggle(productId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Products</h1>
          <p className="mt-1 text-sm text-neutral-700">
            Choose records to inspect or amend. Storefront changes propagate
            within seconds.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">Create product</Link>
        </Button>
      </div>
      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-card border border-border bg-surface p-4"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-primary">
          Publication status
          <select
            name="publicationStatus"
            className="h-control-sm rounded-control border border-border bg-surface px-3 text-sm font-normal"
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="UNPUBLISHED">Unpublished</option>
            <option value="DISCONTINUED">Discontinued</option>
          </select>
        </label>
        <Button type="submit" variant="outline">
          Apply filters
        </Button>
      </form>
      <form
        action={formAction}
        className="flex flex-wrap items-end gap-3 rounded-card border border-border bg-surface p-4"
      >
        <CsrfField />
        <div className="mr-auto">
          <p className="text-sm font-medium text-primary">Bulk amendment</p>
          <p className="text-sm text-neutral-700">
            {selected.size} selected; each result is reported independently.
          </p>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium text-primary">
          Set brand
          <Input name="brand" />
        </label>
        <Button type="submit" disabled={pending}>
          {pending ? "Applying…" : "Apply to selected"}
        </Button>
        {state.formError ? (
          <FormMessage className="w-full">{state.formError}</FormMessage>
        ) : null}
      </form>
      <div className="rounded-card border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <span className="sr-only">Select</span>
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Availability</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.has(product.id)}
                    onChange={() => toggle(product.id)}
                    aria-label={`Select ${product.name}`}
                    className="size-5 accent-primary"
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-neutral-500">{product.slug}</p>
                </TableCell>
                <TableCell>{product.brand ?? "—"}</TableCell>
                <TableCell>{product.publicationStatus}</TableCell>
                <TableCell>
                  {product.inStock === undefined
                    ? "Unknown"
                    : product.inStock
                      ? "In stock"
                      : "Out of stock"}
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  No products match this filter.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
      {nextCursor ? (
        <div>
          <Button asChild variant="outline">
            <Link
              href={`/admin/products?cursor=${encodeURIComponent(nextCursor)}`}
            >
              Next products
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
