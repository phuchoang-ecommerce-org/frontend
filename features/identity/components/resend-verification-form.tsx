"use client";

import { useActionState, useRef } from "react";
import { MailCheck } from "lucide-react";

import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { resendEmailVerification } from "@/features/identity/server/actions";
import type { ActionResult } from "@/features/identity/server/error-mapping";

const initialState: ActionResult = { ok: false };

export function ResendVerificationForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult, formData: FormData): Promise<ActionResult> =>
      resendEmailVerification({ email: formData.get("email") }),
    initialState,
  );

  // 202 either way — non-disclosive, same acceptance message as registration.
  if (state.ok) {
    return (
      <EmptyState
        icon={MailCheck}
        title="Check your email"
        description="If that address has a pending verification, we've sent a new link."
        action={{ label: "Go to sign in", href: "/sign-in" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {state.formError ? (
        <EmptyState
          icon={MailCheck}
          title={state.formError.message}
          action={{
            label: "Try again",
            onClick: () => formRef.current?.querySelector("input")?.focus(),
          }}
        />
      ) : null}
      <Form ref={formRef} action={formAction}>
        <FormField name="email" label="Email" error={state.fieldErrors?.email}>
          <Input type="email" required />
        </FormField>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sending…" : "Resend verification email"}
        </Button>
      </Form>
    </div>
  );
}
