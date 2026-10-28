"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, SelectField, StatusMessage } from "@/components/ui";
import { csrfToken } from "@/lib/session/client-csrf";
import type { InventoryActionResult } from "../server/actions";
import type { StockAdjustment, StockItem } from "../types";
import { StockAdjustmentForm } from "./stock-adjustment-form";
import { StockTable } from "./stock-table";

const reasonCodes = [
  { value: "RECEIPT", label: "Receipt" },
  { value: "CORRECTION", label: "Count correction" },
  { value: "WRITE_OFF", label: "Write-off" },
];

export function InventoryWorkspace({
  items,
  canAdjust,
  onAdjust,
}: {
  items: StockItem[];
  canAdjust: boolean;
  onAdjust: (
    stockItemId: string,
    values: StockAdjustment,
    csrfToken: string,
  ) => Promise<InventoryActionResult>;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<InventoryActionResult | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const selected = items.find((item) => item.id === selectedId);

  async function adjust(values: StockAdjustment) {
    if (!selected) return;
    setPending(true);
    try {
      const next = await onAdjust(selected.id, values, await csrfToken());
      setResult(next);
      if (next.ok) {
        setFormVersion((version) => version + 1);
        router.refresh();
      }
    } catch {
      setResult({
        ok: false,
        message: "The stock adjustment could not be recorded. Try again.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      {result && (
        <StatusMessage
          kind={result.ok ? "success" : "error"}
          message={result.message}
          onDismiss={() => setResult(null)}
        />
      )}
      <StockTable items={items} />
      {canAdjust && selected && (
        <Card title="Adjust stock">
          <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
            <SelectField
              name="stockItem"
              label="Stock record"
              value={selectedId}
              options={items.map((item) => ({
                value: item.id,
                label: `${item.sku} · ${item.warehouse}`,
              }))}
              disabled={pending}
              onChange={(id) => {
                setSelectedId(id);
                setResult(null);
              }}
            />
            <StockAdjustmentForm
              key={`${selected.id}-${formVersion}`}
              stockItemId={selected.id}
              sku={selected.sku}
              warehouseId={selected.warehouse}
              reasonCodes={reasonCodes}
              pending={pending}
              {...(!result?.ok && result?.errors
                ? { errors: result.errors }
                : {})}
              onSubmit={adjust}
            />
          </div>
        </Card>
      )}
      {!canAdjust && items.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Your role can view stock but cannot record adjustments.
        </p>
      )}
    </div>
  );
}
