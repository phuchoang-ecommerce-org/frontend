import * as React from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Wraps Radix Dialog — focus trap and Escape-to-close come from Radix for
 * free. `ModalTitle` is required on every `ModalContent` (Radix warns
 * without one, and a dialog with no accessible name is a real axe
 * violation), even when visually hidden via `ModalDescription`-only layouts.
 */
const Modal = Dialog.Root;
const ModalTrigger = Dialog.Trigger;
const ModalClose = Dialog.Close;

function ModalContent({ className, children, ...props }: React.ComponentProps<typeof Dialog.Content>) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay
        data-slot="modal-overlay"
        className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-150 motion-reduce:transition-none"
      />
      <Dialog.Content
        data-slot="modal-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-card border border-border bg-surface p-6 shadow-lg focus-visible:outline-none",
          className,
        )}
        {...props}
      >
        {children}
        <Dialog.Close
          className="absolute top-4 right-4 rounded-control p-1 text-neutral-500 hover:bg-neutral-50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Close"
        >
          <X aria-hidden="true" className="size-icon" />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

function ModalHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="modal-header" className={cn("mb-4 flex flex-col gap-1", className)} {...props} />;
}

function ModalTitle({ className, ...props }: React.ComponentProps<typeof Dialog.Title>) {
  return (
    <Dialog.Title
      data-slot="modal-title"
      className={cn("text-lg font-semibold text-primary", className)}
      {...props}
    />
  );
}

function ModalDescription({ className, ...props }: React.ComponentProps<typeof Dialog.Description>) {
  return (
    <Dialog.Description
      data-slot="modal-description"
      className={cn("text-sm text-neutral-700", className)}
      {...props}
    />
  );
}

function ModalFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="modal-footer" className={cn("mt-6 flex justify-end gap-2", className)} {...props} />
  );
}

export { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose };
