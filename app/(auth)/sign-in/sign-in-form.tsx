"use client";

import { useActionState, useRef } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CsrfField } from "@/components/ui/csrf-field";
import { RateLimited } from "@/components/ui/rate-limited";
import { logIn } from "@/features/identity/server/actions";
import type { PublicSession } from "@/features/identity/schema/session";
import type { ActionResult } from "@/features/identity/server/error-mapping";

const initialState: ActionResult<PublicSession> = { ok: false };

export function SignInForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (
      _prev: ActionResult<PublicSession>,
      formData: FormData,
    ): Promise<ActionResult<PublicSession>> =>
      logIn({
        email: formData.get("email"),
        password: formData.get("password"),
        csrfToken: formData.get("csrfToken"),
      }),
    initialState,
  );

  if (state.ok) {
    return (
      <EmptyState icon={CheckCircle2} title="Signed in." action={{ label: "Continue", href: "/" }} />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-primary">Sign in</h1>
      {state.formError?.retryAfterSeconds !== undefined ? (
        // A designed retry affordance, never the generic error boundary
        // (US-AUD-04/FE) — sign-in carries the strictest rate limit.
        <RateLimited
          retryAfterSeconds={state.formError.retryAfterSeconds}
          onRetry={() => formRef.current?.querySelector("input")?.focus()}
        />
      ) : state.formError ? (
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
        <CsrfField />
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
