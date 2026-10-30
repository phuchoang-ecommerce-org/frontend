"use client";

import { useState } from "react";
import { StatusMessage } from "@/components/ui";
import { csrfToken } from "@/lib/session/client-csrf";
import type { ShipmentRequest } from "../types";
import { ShipmentForm } from "./shipment-form";

type Result = { ok: true; message: string } | { ok: false; message: string; errors?: Record<string, string> };

export function StaffShipmentPanel({ orderId, orderStatus, onCreate }: { orderId: string; orderStatus: string; onCreate: (value: unknown, csrf: string) => Promise<Result> }) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  async function submit(request: ShipmentRequest) {
    setPending(true);
    setResult(await onCreate(request, await csrfToken()));
    setPending(false);
  }
  return <section aria-labelledby="shipment-heading" className="rounded-card border border-border bg-surface p-4 sm:p-6">
    <h2 id="shipment-heading" className="text-lg font-semibold">Create shipment</h2>
    {result && <div className="mt-3"><StatusMessage kind={result.ok ? "success" : "error"} message={result.message} /></div>}
    {orderStatus === "PACKED" ? <div className="mt-4"><ShipmentForm orderId={orderId} carriers={[{ value: "automatic", label: "Automatic carrier selection" }, { value: "DEVELOPMENT", label: "Development carrier" }]} pending={pending} {...(result && !result.ok && result.errors ? { errors: result.errors } : {})} onSubmit={submit} /></div> : <p className="mt-2 text-sm text-muted">A shipment can be booked when the order reaches <strong>PACKED</strong>.</p>}
  </section>;
}
