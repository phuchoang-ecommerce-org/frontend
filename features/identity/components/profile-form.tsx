"use client";

import { useActionState, useRef } from "react";
import { AlertCircle } from "lucide-react";

import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CsrfField } from "@/components/ui/csrf-field";
import { updateOwnProfile } from "@/features/identity/server/actions";
import type { Account } from "@/features/identity/schema/session";
import type { ActionResult } from "@/features/identity/server/error-mapping";

export interface ProfileFormProps {
  account: Account;
}

export function ProfileForm({ account }: ProfileFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: ActionResult<Account> = { ok: true, data: account };
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult<Account>, formData: FormData): Promise<ActionResult<Account>> =>
      updateOwnProfile({
        displayName: formData.get("displayName") || undefined,
        email: formData.get("email") || undefined,
        csrfToken: formData.get("csrfToken"),
      }),
    initialState,
  );

  const current = state.data ?? account;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-primary">Profile</h1>
      {current.pendingEmail ? (
        <p className="text-sm text-neutral-700">
          Pending: {current.pendingEmail} — check your inbox to confirm this address.
        </p>
      ) : null}
      {state.formError ? (
        <EmptyState
          icon={AlertCircle}
          title={state.formError.message}
          action={{
            label: "Try again",
            onClick: () => formRef.current?.querySelector("input")?.focus(),
          }}
        />
      ) : null}
      <Form ref={formRef} action={formAction}>
        <CsrfField />
        <FormField name="displayName" label="Name" error={state.fieldErrors?.displayName}>
          <Input type="text" defaultValue={current.displayName ?? ""} />
        </FormField>
        <FormField name="email" label="Email" error={state.fieldErrors?.email}>
          <Input type="email" defaultValue={current.email} />
        </FormField>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </Form>
    </div>
  );
}
