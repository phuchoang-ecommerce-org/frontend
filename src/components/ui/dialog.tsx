"use client";

import { useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Dialog as RadixDialog } from "radix-ui";
import { focusRing } from "./styles";

export type DialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  trigger?: ReactNode;
  description?: string;
  onOpenChange: (open: boolean) => void;
};

export function Dialog({ open, title, children, trigger, description, onOpenChange }: DialogProps) {
  const returnFocus = useRef<HTMLElement | null>(null);
  return <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
    {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-40 bg-primary/30 data-[state=open]:animate-in" />
      <RadixDialog.Content onOpenAutoFocus={() => { if (!trigger) returnFocus.current = document.activeElement as HTMLElement; }} onCloseAutoFocus={(event) => { if (!trigger && returnFocus.current?.isConnected) { event.preventDefault(); returnFocus.current.focus(); } }} className="fixed inset-x-2 top-1/2 z-50 mx-auto max-h-dvh max-w-lg -translate-y-1/2 overflow-y-auto rounded-card border border-border bg-surface p-3 font-ui text-ink shadow-sm sm:inset-x-4 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <RadixDialog.Title className="text-xl font-semibold leading-tight text-primary">{title}</RadixDialog.Title>
          <RadixDialog.Close aria-label="Close dialog" className={`inline-flex min-h-control min-w-control items-center justify-center rounded-control text-primary hover:bg-soft ${focusRing}`}><X size={20} aria-hidden="true" /></RadixDialog.Close>
        </div>
        {description && <RadixDialog.Description className="mt-2 text-sm text-muted">{description}</RadixDialog.Description>}
        {!description && <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>}
        <div className="mt-3">{children}</div>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  </RadixDialog.Root>;
}
