"use client";

import { useRef } from "react";
import {
  AlertDialog as PrimitiveAlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./primitives/alert-dialog";

export type AlertDialogProps = {
  open: boolean;
  title: string;
  message: string;
  pending?: boolean;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export function AlertDialog({
  open,
  title,
  message,
  pending = false,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: AlertDialogProps) {
  const returnFocus = useRef<HTMLElement | null>(null);
  return (
    <PrimitiveAlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !pending) onCancel();
      }}
    >
      <AlertDialogContent
        onOpenAutoFocus={() => {
          returnFocus.current = document.activeElement as HTMLElement;
        }}
        onCloseAutoFocus={(event) => {
          if (returnFocus.current?.isConnected) {
            event.preventDefault();
            returnFocus.current.focus();
          }
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            aria-busy={pending || undefined}
            onClick={(event) => {
              event.preventDefault();
              void onConfirm();
            }}
          >
            {pending ? `${confirmLabel}…` : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </PrimitiveAlertDialog>
  );
}
