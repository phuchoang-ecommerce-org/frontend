"use client";

import { useRef, type ReactNode } from "react";
import {
  Dialog as PrimitiveDialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./primitives/dialog";

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
  return <PrimitiveDialog open={open} onOpenChange={onOpenChange}>
    {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
    <DialogContent onOpenAutoFocus={() => { if (!trigger) returnFocus.current = document.activeElement as HTMLElement; }} onCloseAutoFocus={(event) => { if (!trigger && returnFocus.current?.isConnected) { event.preventDefault(); returnFocus.current.focus(); } }}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription hidden={!description}>{description || title}</DialogDescription>
      </DialogHeader>
      {children}
    </DialogContent>
  </PrimitiveDialog>;
}
