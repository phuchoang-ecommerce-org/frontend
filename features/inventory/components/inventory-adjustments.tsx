"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CsrfField } from "@/components/ui/csrf-field";
import { FormField, FormMessage } from "@/components/ui/form";
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
  recordInventoryAdjustment,
  type InventoryAdjustmentActionResult,
} from "../server/inventory-actions";
import type { MockInventorySnapshot } from "../server/inventory-mock";

const initialState: InventoryAdjustmentActionResult = { ok: false };

function formatDelta(delta: number): string {
  return `${delta > 0 ? "+" : ""}${delta}`;
}

export function InventoryAdjustments({
  snapshot,
}: {
  snapshot: MockInventorySnapshot;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_previous: InventoryAdjustmentActionResult, formData: FormData) => {
      const result = await recordInventoryAdjustment({
        csrfToken: formData.get("csrfToken"),
        sku: formData.get("sku"),
        delta: formData.get("delta"),
        reason: formData.get("reason"),
      });
      if (result.ok) router.refresh();
      return result;
    },
    initialState,
  );

  return (
    <div className="flex max-w-content flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-accent">
            Inventory operations
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-primary">
            Stock adjustments
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-700">
            Record a counted difference with its reason. Available stock is the
            server-authoritative value; reserved units cannot be written off.
          </p>
        </div>
      </header>

      <section
        className="rounded-card border border-border bg-surface p-4"
        aria-labelledby="stock-summary-heading"
      >
        <h2
          id="stock-summary-heading"
          className="text-base font-semibold text-primary"
        >
          Current stock
        </h2>
        <div className="mt-3 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>On hand</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Available</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshot.stockItems.map((item) => (
                <TableRow key={item.sku}>
                  <TableCell>
                    <span className="font-medium">{item.sku}</span>
                    <span className="mt-1 block text-xs text-neutral-500">
                      {item.productName}
                    </span>
                  </TableCell>
                  <TableCell>{item.onHand}</TableCell>
                  <TableCell>{item.reserved}</TableCell>
                  <TableCell>{item.available}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section
        className="rounded-card border border-border bg-surface p-4"
        aria-labelledby="record-adjustment-heading"
      >
        <h2
          id="record-adjustment-heading"
          className="text-base font-semibold text-primary"
        >
          Record an adjustment
        </h2>
        <form
          action={formAction}
          className="mt-3 grid gap-3 md:grid-cols-3 md:items-end"
        >
          <CsrfField />
          <FormField name="sku" label="SKU" error={state.fieldErrors?.sku}>
            <select
              defaultValue=""
              className="h-control-sm rounded-control border border-border bg-surface px-3 text-base text-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <option value="" disabled>
                Choose a SKU
              </option>
              {snapshot.stockItems.map((item) => (
                <option key={item.sku} value={item.sku}>
                  {item.sku} — {item.productName}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            name="delta"
            label="Quantity change"
            error={state.fieldErrors?.delta}
          >
            <Input
              type="number"
              inputMode="numeric"
              step="1"
              placeholder="e.g. -2"
            />
          </FormField>
          <FormField
            name="reason"
            label="Reason"
            error={state.fieldErrors?.reason}
            className="md:col-span-2"
          >
            <Input placeholder="e.g. Cycle count reconciliation" />
          </FormField>
          <Button type="submit" disabled={pending}>
            {pending ? "Recording…" : "Record adjustment"}
          </Button>
          {state.formError ? (
            <FormMessage className="md:col-span-3">
              {state.formError}
            </FormMessage>
          ) : null}
        </form>
      </section>

      {state.conflict ? (
        <section
          className="rounded-card border-2 border-primary bg-neutral-50 p-4"
          role="alert"
          aria-labelledby="insufficient-stock-heading"
        >
          <p className="text-sm font-medium text-primary">
            {state.conflict.code}
          </p>
          <h2
            id="insufficient-stock-heading"
            className="mt-1 text-lg font-semibold text-primary"
          >
            This adjustment would make available stock negative.
          </h2>
          <p className="mt-1 text-sm text-neutral-700">
            {state.conflict.reservedQuantity} unit
            {state.conflict.reservedQuantity === 1 ? " is" : "s are"} reserved
            and cannot be removed from available stock.
          </p>
          {state.conflict.holdingOrders.length > 0 ? (
            <p className="mt-2 text-sm text-neutral-700">
              Orders holding stock: {state.conflict.holdingOrders.join(", ")}.
            </p>
          ) : null}
        </section>
      ) : null}

      <section
        className="rounded-card border border-border bg-surface"
        aria-labelledby="adjustment-history-heading"
      >
        <div className="px-5 border-b border-border py-3">
          <h2
            id="adjustment-history-heading"
            className="text-base font-semibold text-primary"
          >
            Adjustment history
          </h2>
          <p className="mt-1 text-sm text-neutral-700">
            Most recent first. Entries are append-only.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Recorded by</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {snapshot.adjustments.map((adjustment) => (
              <TableRow key={adjustment.id}>
                <TableCell>{adjustment.sku}</TableCell>
                <TableCell>{formatDelta(adjustment.delta)}</TableCell>
                <TableCell>
                  {adjustment.beforeAvailable} → {adjustment.afterAvailable}
                </TableCell>
                <TableCell>{adjustment.reason}</TableCell>
                <TableCell>{adjustment.actor}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
