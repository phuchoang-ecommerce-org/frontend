"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "./primitives/alert";
import { Button as PrimitiveButton } from "./primitives/button";

export type StatusMessageProps = {
  kind: "info" | "success" | "error";
  message: string;
  title?: string | undefined;
  className?: string | undefined;
  onDismiss?: (() => void) | undefined;
};

const icons = { info: Info, success: CheckCircle2, error: XCircle };

export function StatusMessage({
  kind,
  message,
  title,
  className,
  onDismiss,
}: StatusMessageProps) {
  const Icon = icons[kind];
  return (
    <Alert
      role={kind === "error" ? "alert" : "status"}
      variant={kind === "error" ? "destructive" : "default"}
      className={className}
    >
      <Icon size={16} aria-hidden="true" />
      {title && <AlertTitle className="font-semibold">{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
      {onDismiss && (
        <AlertAction>
          <PrimitiveButton
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onDismiss}
            aria-label="Dismiss message"
          >
            <X size={16} aria-hidden="true" />
          </PrimitiveButton>
        </AlertAction>
      )}
    </Alert>
  );
}
