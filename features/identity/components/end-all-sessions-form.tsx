"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CsrfField } from "@/components/ui/csrf-field";
import { endAllOwnSessions } from "@/features/identity/server/actions";
import type { ActionResult } from "@/features/identity/server/error-mapping";

const initialState: ActionResult = { ok: false };

/** `UC-CUS-04` A1 — separate from the password-change form; either can be used on its own. */
export function EndAllSessionsForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult, formData: FormData): Promise<ActionResult> =>
      endAllOwnSessions({ csrfToken: formData.get("csrfToken") }),
    initialState,
  );

  if (state.ok) {
    return <EmptyState icon={CheckCircle2} title="Every session has been ended." action={{ label: "Sign in again", href: "/sign-in" }} />;
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-primary">Sessions</h2>
      <p className="text-sm text-neutral-700">Sign out of every device where you&apos;re currently signed in.</p>
      {state.formError ? <p className="text-sm text-neutral-900">{state.formError.message}</p> : null}
      <form action={formAction}>
        <CsrfField />
        <Button type="submit" variant="outline" disabled={isPending}>
          {isPending ? "Ending sessions…" : "End all other sessions"}
        </Button>
      </form>
    </div>
  );
}
