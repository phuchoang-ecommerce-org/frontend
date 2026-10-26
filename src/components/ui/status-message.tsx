"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { Alert, AlertAction, AlertDescription } from "./primitives/alert";
import { Button as PrimitiveButton } from "./primitives/button";

export type StatusMessageProps = {
  kind: "info" | "success" | "error";
  message: string;
  onDismiss?: () => void;
};

const icons = { info: Info, success: CheckCircle2, error: XCircle };

export function StatusMessage({ kind, message, onDismiss }: StatusMessageProps) {
  const Icon = icons[kind];
  return <Alert role={kind === "error" ? "alert" : "status"} variant={kind === "error" ? "destructive" : "default"}>
    <Icon size={16} aria-hidden="true" />
    <AlertDescription>{message}</AlertDescription>
    {onDismiss && <AlertAction><PrimitiveButton type="button" variant="ghost" size="icon-sm" onClick={onDismiss} aria-label="Dismiss message"><X size={16} aria-hidden="true" /></PrimitiveButton></AlertAction>}
  </Alert>;
}
