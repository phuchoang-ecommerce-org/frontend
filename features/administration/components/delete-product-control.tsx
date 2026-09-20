"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CsrfField } from "@/components/ui/csrf-field";
import { FormMessage } from "@/components/ui/form";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/modal";
import {
  deleteAdminProduct,
  setAdminProductPublication,
  type AdminActionResult,
} from "@/features/administration/server/actions";

import {
  initialProductActionState,
  ProductActionResult,
} from "./product-action-state";

export function DeleteProductControl({ productId }: { productId: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_previous: AdminActionResult, formData: FormData) => {
      const result = await deleteAdminProduct(productId, {
        csrfToken: formData.get("csrfToken"),
      });
      if (result.ok) router.push("/admin/products");
      return result;
    },
    initialProductActionState,
  );
  const [unpublishState, unpublishAction, unpublishPending] = useActionState(
    async (_previous: AdminActionResult, formData: FormData) => {
      const result = await setAdminProductPublication(productId, {
        csrfToken: formData.get("csrfToken"),
        publicationStatus: "UNPUBLISHED",
      });
      if (result.ok) router.refresh();
      return result;
    },
    initialProductActionState,
  );
  return (
    <section className="p-5 rounded-card border border-neutral-300 bg-neutral-50">
      <h2 className="text-lg font-semibold text-primary">Remove product</h2>
      <p className="mt-1 text-sm text-neutral-700">
        Removal is permanent for this catalog record. If stock or open orders
        exist, unpublish instead.
      </p>
      <Modal>
        <ModalTrigger asChild>
          <Button type="button" variant="outline" className="mt-4">
            Remove product
          </Button>
        </ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Remove this product?</ModalTitle>
            <ModalDescription>
              This cannot be undone. The server checks stock and open orders
              before removing it.
            </ModalDescription>
          </ModalHeader>
          <form action={formAction}>
            <CsrfField />
            <ModalFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Removing…" : "Confirm removal"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      {state.conflict === "removal-blocked" ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <FormMessage>
            This product has stock or open orders. Unpublish it to remove it
            from the storefront.
          </FormMessage>
          <form action={unpublishAction}>
            <CsrfField />
            <Button type="submit" variant="outline" disabled={unpublishPending}>
              {unpublishPending ? "Unpublishing…" : "Unpublish instead"}
            </Button>
          </form>
        </div>
      ) : (
        <ProductActionResult state={state} />
      )}
      {unpublishState.formError ? (
        <FormMessage className="mt-3">{unpublishState.formError}</FormMessage>
      ) : null}
    </section>
  );
}
