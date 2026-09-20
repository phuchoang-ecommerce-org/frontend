"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CsrfField } from "@/components/ui/csrf-field";
import { Input } from "@/components/ui/input";
import {
  setAdminProductPublication,
  type AdminActionResult,
} from "@/features/administration/server/actions";

import {
  initialProductActionState,
  ProductActionResult,
} from "./product-action-state";

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
    initialProductActionState,
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
        <ProductActionResult state={state} />
      </form>
    </section>
  );
}
