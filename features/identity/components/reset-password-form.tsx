"use client";

import { useActionState, useRef } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { completePasswordReset } from "@/features/identity/server/actions";
import type { ActionResult } from "@/features/identity/server/error-mapping";

const initialState: ActionResult = { ok: false };

export interface ResetPasswordFormProps {
  token?: string | undefined;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult, formData: FormData): Promise<ActionResult> =>
      completePasswordReset({
        token: formData.get("token"),
        newPassword: formData.get("newPassword"),
      }),
    initialState,
  );

  if (state.ok) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="Password updated"
        description="Every existing session has been ended. Sign in with your new password."
        action={{ label: "Go to sign in", href: "/sign-in" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-primary">Set a new password</h1>
      {state.formError ? (
        // Byte-identical copy for every cause — the contract carries no code
        // distinguishing an expired, used, or unknown token (see error-map.ts).
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
        <input type="hidden" name="token" value={token ?? ""} />
        <FormField name="newPassword" label="New password" error={state.fieldErrors?.newPassword}>
          <Input type="password" required />
        </FormField>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Set new password"}
        </Button>
      </Form>
    </div>
  );
}
