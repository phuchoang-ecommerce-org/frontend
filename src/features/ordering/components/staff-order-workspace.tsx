"use client";

import { useState } from "react";
import { Button, SelectField, StatusMessage, TextField } from "@/components/ui";
import { csrfToken } from "@/lib/session/client-csrf";
import type { Order } from "@/lib/api/ordering";
import type { StaffOrderActionResult } from "../server/staff-actions";

type Action = (value: unknown, csrf: string) => Promise<StaffOrderActionResult>;

export function StaffOrderWorkspace({ order, onAdvance }: { order: Order; onAdvance: Action }) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<StaffOrderActionResult | null>(null);
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");
  const transitions = order.permittedTransitions ?? [];

  async function advance() {
    setPending(true);
    setResult(await onAdvance({ orderId: order.id, status, reason }, await csrfToken()));
    setPending(false);
  }
  return <section aria-labelledby="processing-heading" className="space-y-6 rounded-card border border-border bg-surface p-4 sm:p-6">
    <div><h2 id="processing-heading" className="text-lg font-semibold">Process order</h2><p className="text-sm text-muted">Current status: <strong>{order.status}</strong>. Changes are re-read from the server after each write.</p></div>
    {result && <StatusMessage kind={result.ok ? "success" : "error"} message={result.message} />}
    <div>
      <form onSubmit={(event) => { event.preventDefault(); void advance(); }} className="space-y-4" aria-busy={pending}>
        <h3 className="font-medium">Advance status</h3>
        {transitions.length ? <><SelectField name="status" label="Valid next status" value={status} options={transitions.map((value) => ({ value, label: value }))} required onChange={setStatus} />
          <TextField name="reason" label="Reason (optional)" value={reason} onChange={setReason} />
          <Button type="submit" loading={pending}>Update status</Button></> : <p className="text-sm text-muted">There are no staff transitions available for this status.</p>}
      </form>
    </div>
  </section>;
}
