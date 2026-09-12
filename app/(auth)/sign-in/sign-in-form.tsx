"use client";

import { useActionState, useRef } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { logIn } from "@/features/identity/server/actions";
import type { Session } from "@/features/identity/schema/session";
import type { ActionResult } from "@/features/identity/server/error-mapping";

const initialState: ActionResult<Session> = { ok: false };

export function SignInForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult<Session>, formData: FormData): Promise<ActionResult<Session>> =>
      logIn({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    initialState,
  );

  // lib/session's token/CSRF custody is still a no-op this sprint (Sprint 4's
  // EN-FE-API-2) — a successful call here does not leave the browser holding
  // a real ecp_session cookie, so redirecting to /account would just bounce
  // straight back via proxy.ts. Acknowledge success in place instead.
  if (state.ok) {
    return (
      <EmptyState icon={CheckCircle2} title="Signed in." action={{ label: "Continue", href: "/" }} />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-primary">Sign in</h1>
      {state.formError ? (
        // Byte-identical regardless of cause (unknown account vs wrong
        // password are indistinguishable, BR-CUS-04) — worded so it could
        // later be reused verbatim for a password-reset failure.
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
        <FormField name="email" label="Email" error={state.fieldErrors?.email}>
          <Input type="email" required />
        </FormField>
        <FormField name="password" label="Password" error={state.fieldErrors?.password}>
          <Input type="password" required />
        </FormField>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Signing in…" : "Sign in"}
        </Button>
      </Form>
    </div>
  );
}
