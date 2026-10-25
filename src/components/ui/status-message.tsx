"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { focusRing } from "./styles";

export type StatusMessageProps = {
  kind: "info" | "success" | "error";
  message: string;
  onDismiss?: () => void;
};

const icons = { info: Info, success: CheckCircle2, error: XCircle };

export function StatusMessage({ kind, message, onDismiss }: StatusMessageProps) {
  const Icon = icons[kind];
  return <div role={kind === "error" ? "alert" : "status"} className="flex items-start gap-2 rounded-card border border-border bg-surface p-2 font-ui text-sm text-ink">
    <Icon className="mt-1 shrink-0 text-primary" size={18} aria-hidden="true" />
    <p className="min-w-0 flex-1 leading-relaxed">{message}</p>
    {onDismiss && <button type="button" onClick={onDismiss} aria-label="Dismiss message" className={`-my-1 inline-flex min-h-control min-w-control items-center justify-center rounded-control text-primary hover:bg-soft ${focusRing}`}><X size={16} aria-hidden="true" /></button>}
  </div>;
}
