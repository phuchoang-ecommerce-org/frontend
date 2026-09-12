"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CsrfField } from "@/components/ui/csrf-field";
import { removeOwnAddress } from "@/features/identity/server/actions";
import type { ActionResult } from "@/features/identity/server/error-mapping";

const initialState: ActionResult = { ok: false };

export function RemoveAddressButton({ addressId }: { addressId: string }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult, formData: FormData): Promise<ActionResult> => {
      const result = await removeOwnAddress(addressId, { csrfToken: formData.get("csrfToken") });
      if (result.ok) router.refresh();
      return result;
    },
    initialState,
  );

  return (
    <form action={formAction} className="inline-flex">
      <CsrfField />
      <Button type="submit" variant="ghost" size="icon" disabled={isPending} aria-label="Remove address">
        <Trash2 aria-hidden="true" className="size-icon" />
      </Button>
      {state.formError ? <span className="sr-only">{state.formError.message}</span> : null}
    </form>
  );
}
