"use client";

import { useActionState, useRef } from "react";
import { MailCheck } from "lucide-react";

import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { registerAccount } from "@/features/identity/server/actions";
import type { ActionResult } from "@/features/identity/server/error-mapping";

const initialState: ActionResult = { ok: false };

export function RegisterForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult, formData: FormData): Promise<ActionResult> =>
      registerAccount({
        email: formData.get("email"),
        password: formData.get("password"),
        displayName: formData.get("displayName") || undefined,
      }),
    initialState,
  );

  // 202 and the non-disclosive duplicate-address case are indistinguishable
  // by contract — the same single acceptance message covers both.
  if (state.ok) {
    return (
      <EmptyState
        icon={MailCheck}
        title="Check your email"
        description="If that address is eligible, we've sent a link to verify it."
        action={{ label: "Go to sign in", href: "/sign-in" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-primary">Create your account</h1>
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
        <FormField name="password" label="Password" error={state.fieldErrors?.password}>
          <Input type="password" required />
        </FormField>
        <FormField name="displayName" label="Name (optional)" error={state.fieldErrors?.displayName}>
          <Input type="text" />
        </FormField>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating account…" : "Create account"}
        </Button>
      </Form>
    </div>
  );
}
