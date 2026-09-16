"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CsrfField } from "@/components/ui/csrf-field";
import { FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
  addAdminProductImage,
  addAdminVariant,
  changeAdminVariantPrice,
  deleteAdminProduct,
  removeAdminProductImage,
  removeAdminVariant,
  setAdminProductPublication,
  type AdminActionResult,
} from "@/features/administration/server/actions";
import type {
  AdminProductImage,
  AdminVariant,
} from "@/features/administration/schema/catalog";

const initialState: AdminActionResult = { ok: false };

function ResultMessage({ state }: { state: AdminActionResult }) {
  if (state.conflict === "duplicate-sku")
    return (
      <FormMessage>
        That SKU is already in use or has been retired. Use a different SKU.
      </FormMessage>
    );
  if (state.conflict === "removal-blocked")
    return (
      <FormMessage>
        This record has stock or open orders. Unpublish the product instead.
      </FormMessage>
    );
  return state.formError ? <FormMessage>{state.formError}</FormMessage> : null;
}

export function PublicationControl({
  productId,
  status,
}: {
  productId: string;
  status: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_previous: AdminActionResult, formData: FormData) => {
      const result = await setAdminProductPublication(productId, {
        csrfToken: formData.get("csrfToken"),
        publicationStatus: formData.get("publicationStatus"),
        reason: formData.get("reason") || undefined,
      });
      if (result.ok) router.refresh();
      return result;
    },
    initialState,
  );
  return (
    <section className="p-5 rounded-card border border-border bg-surface">
      <h2 className="text-lg font-semibold text-primary">Publication</h2>
      <p className="mt-1 text-sm text-neutral-700">
        Current status: {status}. A change reaches the storefront within
        seconds.
      </p>
      <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
        <CsrfField />
        <label className="flex flex-col gap-1 text-sm font-medium text-primary">
          New status
          <select
            name="publicationStatus"
            defaultValue={status}
            className="h-control-sm rounded-control border border-border bg-surface px-3 text-sm font-normal"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="UNPUBLISHED">Unpublished</option>
            <option value="DISCONTINUED">Discontinued</option>
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-primary">
          Reason (optional)
          <Input name="reason" />
        </label>
        <Button type="submit" disabled={pending}>
          {pending ? "Updating…" : "Update publication"}
        </Button>
        <ResultMessage state={state} />
      </form>
    </section>
  );
}

export function VariantManager({
  productId,
  variants,
}: {
  productId: string;
  variants: AdminVariant[];
}) {
  const router = useRouter();
  const [addState, addAction, addPending] = useActionState(
    async (_previous: AdminActionResult, formData: FormData) => {
      const result = await addAdminVariant(productId, {
        csrfToken: formData.get("csrfToken"),
        sku: formData.get("sku"),
        name: formData.get("name") || undefined,
        listPrice: {
          amount: formData.get("amount"),
          currency: formData.get("currency"),
        },
        active: formData.get("active") === "on",
      });
      if (result.ok) router.refresh();
      return result;
    },
    initialState,
  );
  return (
    <section className="p-5 rounded-card border border-border bg-surface">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-primary">Variants</h2>
          <p className="text-sm text-neutral-700">
            Prices are amended and audited separately.
          </p>
        </div>
        <span className="text-sm text-neutral-700">
          {variants.length} variants
        </span>
      </div>
      <div className="mt-4 divide-y divide-border">
        {variants.map((variant) => (
          <VariantRow
            key={variant.id}
            productId={productId}
            variant={variant}
          />
        ))}
      </div>
      <form
        action={addAction}
        className="mt-4 grid gap-3 border-t border-border pt-4 md:grid-cols-2"
      >
        <CsrfField />
        <label className="flex flex-col gap-1 text-sm font-medium text-primary">
          SKU
          <Input name="sku" required />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-primary">
          Name
          <Input name="name" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-primary">
          Price amount
          <Input name="amount" inputMode="decimal" required />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-primary">
          Currency
          <Input name="currency" defaultValue="VND" maxLength={3} required />
        </label>
        <label className="flex items-center gap-2 text-sm text-primary">
          <input
            name="active"
            type="checkbox"
            defaultChecked
            className="size-5 accent-primary"
          />{" "}
          Active
        </label>
        <div className="flex items-end justify-end">
          <Button type="submit" disabled={addPending}>
            {addPending ? "Adding…" : "Add variant"}
          </Button>
        </div>
        <ResultMessage state={addState} />
      </form>
    </section>
  );
}

function VariantRow({
  productId,
  variant,
}: {
  productId: string;
  variant: AdminVariant;
}) {
  const router = useRouter();
  const [priceState, priceAction, pricePending] = useActionState(
    async (_previous: AdminActionResult, formData: FormData) => {
      const result = await changeAdminVariantPrice(productId, variant.id, {
        csrfToken: formData.get("csrfToken"),
        listPrice: {
          amount: formData.get("amount"),
          currency: formData.get("currency"),
        },
        reason: formData.get("reason"),
      });
      if (result.ok) router.refresh();
      return result;
    },
    initialState,
  );
  const [removeState, removeAction, removePending] = useActionState(
    async (_previous: AdminActionResult, formData: FormData) => {
      const result = await removeAdminVariant(productId, variant.id, {
        csrfToken: formData.get("csrfToken"),
      });
      if (result.ok) router.refresh();
      return result;
    },
    initialState,
  );
  return (
    <div className="grid gap-3 py-4 lg:grid-cols-2">
      <div>
        <p className="font-medium text-primary">{variant.sku}</p>
        <p className="text-sm text-neutral-700">
          {variant.name ?? "Unnamed variant"} ·{" "}
          {variant.active ? "Active" : "Inactive"}
        </p>
        <form
          action={priceAction}
          className="mt-3 flex flex-wrap items-end gap-2"
        >
          <CsrfField />
          <label className="flex flex-col gap-1 text-xs font-medium text-neutral-700">
            Amount
            <Input
              name="amount"
              defaultValue={variant.listPrice.amount}
              inputMode="decimal"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-neutral-700">
            Currency
            <Input
              name="currency"
              defaultValue={variant.listPrice.currency}
              maxLength={3}
              required
            />
          </label>
          <label className="min-w-44 flex flex-1 flex-col gap-1 text-xs font-medium text-neutral-700">
            Audit reason
            <Input name="reason" required />
          </label>
          <Button type="submit" variant="outline" disabled={pricePending}>
            {pricePending ? "Saving…" : "Change price"}
          </Button>
          {priceState.formError ? (
            <FormMessage className="w-full">{priceState.formError}</FormMessage>
          ) : null}
        </form>
      </div>
      <form action={removeAction} className="flex items-start">
        <CsrfField />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={removePending}
          aria-label={`Remove ${variant.sku}`}
        >
          <Trash2 aria-hidden="true" className="size-icon" />
        </Button>
        {removeState.conflict === "removal-blocked" ? (
          <span className="sr-only">
            This variant cannot be removed while stock or open orders reference
            it.
          </span>
        ) : null}
      </form>
    </div>
  );
}

export function ImageManager({
  productId,
  images,
}: {
  productId: string;
  images: AdminProductImage[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_previous: AdminActionResult, formData: FormData) => {
      const result = await addAdminProductImage(productId, {
        csrfToken: formData.get("csrfToken"),
        url: formData.get("url"),
        altText: formData.get("altText") || undefined,
        ...(formData.get("sortOrder")
          ? { sortOrder: Number(formData.get("sortOrder")) }
          : {}),
      });
      if (result.ok) router.refresh();
      return result;
    },
    initialState,
  );
  return (
    <section className="p-5 rounded-card border border-border bg-surface">
      <h2 className="text-lg font-semibold text-primary">Images</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {images.map((image) => (
          <ImageRow key={image.id} productId={productId} image={image} />
        ))}
        {images.length === 0 ? (
          <p className="text-sm text-neutral-700">No images have been added.</p>
        ) : null}
      </div>
      <form
        action={formAction}
        className="mt-4 grid gap-3 border-t border-border pt-4 md:grid-cols-3"
      >
        <CsrfField />
        <label className="flex flex-col gap-1 text-sm font-medium text-primary">
          Image URL
          <Input name="url" type="url" required />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-primary">
          Alt text
          <Input name="altText" />
        </label>
        <div className="flex items-end">
          <Button type="submit" disabled={pending}>
            <ImagePlus aria-hidden="true" className="size-icon" />
            {pending ? "Adding…" : "Add image"}
          </Button>
        </div>
        <ResultMessage state={state} />
      </form>
    </section>
  );
}

function ImageRow({
  productId,
  image,
}: {
  productId: string;
  image: AdminProductImage;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_previous: AdminActionResult, formData: FormData) => {
      const result = await removeAdminProductImage(productId, image.id, {
        csrfToken: formData.get("csrfToken"),
      });
      if (result.ok) router.refresh();
      return result;
    },
    initialState,
  );
  return (
    <div className="flex items-center gap-3 rounded-control border border-border p-3">
      <a
        href={image.url}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 flex-1 truncate text-sm underline-offset-4 hover:underline"
      >
        {image.altText ?? image.url}
      </a>
      <form action={formAction}>
        <CsrfField />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={pending}
          aria-label="Remove image"
        >
          <Trash2 aria-hidden="true" className="size-icon" />
        </Button>
      </form>
      {state.formError ? (
        <span className="sr-only">{state.formError}</span>
      ) : null}
    </div>
  );
}

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
    initialState,
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
    initialState,
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
        <ResultMessage state={state} />
      )}
      {unpublishState.formError ? (
        <FormMessage className="mt-3">{unpublishState.formError}</FormMessage>
      ) : null}
    </section>
  );
}
