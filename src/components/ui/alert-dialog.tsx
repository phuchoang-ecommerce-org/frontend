"use client";

import { useRef } from "react";
import { AlertDialog as RadixAlertDialog } from "radix-ui";
import { Button } from "./button";

export type AlertDialogProps = {
  open: boolean;
  title: string;
  message: string;
  pending?: boolean;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export function AlertDialog({ open, title, message, pending = false, confirmLabel = "Confirm", onConfirm, onCancel }: AlertDialogProps) {
  const returnFocus = useRef<HTMLElement | null>(null);
  return <RadixAlertDialog.Root open={open} onOpenChange={(next) => { if (!next && !pending) onCancel(); }}>
    <RadixAlertDialog.Portal>
      <RadixAlertDialog.Overlay className="fixed inset-0 z-40 bg-primary/30" />
      <RadixAlertDialog.Content onOpenAutoFocus={() => { returnFocus.current = document.activeElement as HTMLElement; }} onCloseAutoFocus={(event) => { if (returnFocus.current?.isConnected) { event.preventDefault(); returnFocus.current.focus(); } }} className="fixed inset-x-2 top-1/2 z-50 mx-auto max-h-dvh max-w-md -translate-y-1/2 overflow-y-auto rounded-card border border-border bg-surface p-3 font-ui shadow-sm sm:inset-x-4 sm:p-4">
        <RadixAlertDialog.Title className="text-xl font-semibold leading-tight text-primary">{title}</RadixAlertDialog.Title>
        <RadixAlertDialog.Description className="mt-2 text-base leading-relaxed text-ink">{message}</RadixAlertDialog.Description>
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <RadixAlertDialog.Cancel asChild><Button variant="secondary" disabled={pending}>Cancel</Button></RadixAlertDialog.Cancel>
          <RadixAlertDialog.Action asChild onClick={(event) => { event.preventDefault(); void onConfirm(); }}><Button loading={pending}>{confirmLabel}</Button></RadixAlertDialog.Action>
        </div>
      </RadixAlertDialog.Content>
    </RadixAlertDialog.Portal>
  </RadixAlertDialog.Root>;
}
