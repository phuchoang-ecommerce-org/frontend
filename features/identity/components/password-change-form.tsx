"use client";

import { useActionState, useRef } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CsrfField } from "@/components/ui/csrf-field";
import { changeOwnPassword } from "@/features/identity/server/actions";
import type { ActionResult } from "@/features/identity/server/error-mapping";

const initialState: ActionResult = { ok: false };

export function PasswordChangeForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult, formData: FormData): Promise<ActionResult> =>
      changeOwnPassword({
        currentPassword: formData.get("currentPassword"),
        newPassword: formData.get("newPassword"),
        endOtherSessions: formData.get("endOtherSessions") === "on",
        csrfToken: formData.get("csrfToken"),
      }),
    initialState,
  );

  if (state.ok) {
    return <EmptyState icon={CheckCircle2} title="Password changed." action={{ label: "Done", href: "/account/security" }} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-primary">Change password</h2>
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
        <FormField name="currentPassword" label="Current password" error={state.fieldErrors?.currentPassword}>
          <Input type="password" required />
        </FormField>
        <FormField name="newPassword" label="New password" error={state.fieldErrors?.newPassword}>
          <Input type="password" required />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-neutral-900">
          <input type="checkbox" name="endOtherSessions" defaultChecked className="size-4" />
          End my other sessions
        </label>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Changing…" : "Change password"}
        </Button>
      </Form>
    </div>
  );
}
