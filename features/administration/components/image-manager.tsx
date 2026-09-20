"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CsrfField } from "@/components/ui/csrf-field";
import { Input } from "@/components/ui/input";
import {
  addAdminProductImage,
  removeAdminProductImage,
  type AdminActionResult,
} from "@/features/administration/server/actions";
import type { AdminProductImage } from "@/features/administration/schema/catalog";

import {
  initialProductActionState,
  ProductActionResult,
} from "./product-action-state";

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
    initialProductActionState,
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
        <ProductActionResult state={state} />
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
    initialProductActionState,
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
        <Button type="submit" variant="ghost" size="icon" disabled={pending} aria-label="Remove image">
          <Trash2 aria-hidden="true" className="size-icon" />
        </Button>
      </form>
      {state.formError ? <span className="sr-only">{state.formError}</span> : null}
    </div>
  );
}
