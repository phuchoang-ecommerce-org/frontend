import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout";
import { ForgotPasswordForm } from "@/features/identity/components";
import { requestPasswordResetAction } from "@/features/identity/server/guest-actions";

export const metadata: Metadata = { title: "Reset password | ECP" };

export default function ForgotPasswordPage() {
  return (
    <PageShell title="Reset your password">
      <div className="max-w-md space-y-6">
        <p>Enter your account email and we’ll send a password reset link.</p>
        <ForgotPasswordForm onSubmit={requestPasswordResetAction} />
        <Link
          href="/login"
          className="inline-block text-sm font-medium underline underline-offset-4"
        >
          Back to sign-in
        </Link>
      </div>
    </PageShell>
  );
}
