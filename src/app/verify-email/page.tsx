import type { Metadata } from "next";
import { PageShell } from "@/components/layout";
import {
  ResendVerificationForm,
  VerifyEmailButton,
} from "@/features/identity/components";
import {
  resendVerificationAction,
  verifyEmailAction,
} from "@/features/identity/server/guest-actions";

export const metadata: Metadata = { title: "Verify email | ECP" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <PageShell title="Verify your email">
      <div className="max-w-md space-y-8">
        {token ? (
          <section className="space-y-3">
            <p>Confirm this email address to finish setting up your account.</p>
            <VerifyEmailButton token={token} onVerify={verifyEmailAction} />
          </section>
        ) : (
          <p>
            Open the verification link from your email, or request a new one
            below.
          </p>
        )}
        <section className="space-y-3 border-t border-border pt-6">
          <h2 className="text-lg font-semibold">Need another link?</h2>
          <ResendVerificationForm onSubmit={resendVerificationAction} />
        </section>
      </div>
    </PageShell>
  );
}
