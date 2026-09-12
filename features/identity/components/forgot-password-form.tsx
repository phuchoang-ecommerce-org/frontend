"use client";

import { useActionState, useRef } from "react";
import { MailCheck } from "lucide-react";

import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requestPasswordReset } from "@/features/identity/server/actions";
import type { ActionResult } from "@/features/identity/server/error-mapping";

const initialState: ActionResult = { ok: false };

/**
 * `BR-CUS-04` — the response is identical whether or not the address is
 * registered. There is no "we couldn't find that account" state to
 * accidentally render: the action always returns `{ok:true}` for a
 * well-formed request, so the only branches here are field validation and
 * success.
 */
export function ForgotPasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult, formData: FormData): Promise<ActionResult> =>
      requestPasswordReset({ email: formData.get("email") }),
    initialState,
  );

  if (state.ok) {
    return (
      <EmptyState
        icon={MailCheck}
        title="Check your email"
        description="If that address is registered, we've sent a link to reset your password."
        action={{ label: "Go to sign in", href: "/sign-in" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-primary">Forgot your password?</h1>
      <Form ref={formRef} action={formAction}>
        <FormField name="email" label="Email" error={state.fieldErrors?.email}>
          <Input type="email" required />
        </FormField>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sending…" : "Send reset link"}
        </Button>
      </Form>
    </div>
  );
}
