"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalTrigger } from "@/components/ui/modal";
import { addOwnAddress } from "@/features/identity/server/actions";
import { AddressForm } from "./address-form";

export function AddAddressDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>
        <Button type="button">
          <Plus aria-hidden="true" className="size-icon" />
          Add address
        </Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Add address</ModalTitle>
        </ModalHeader>
        <AddressForm
          submitAction={addOwnAddress}
          onSaved={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </ModalContent>
    </Modal>
  );
}
