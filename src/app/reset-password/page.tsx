import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout";
import { ResetPasswordForm } from "@/features/identity/components";
import { completePasswordResetAction } from "@/features/identity/server/guest-actions";

export const metadata: Metadata = { title: "Set new password | ECP" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <PageShell title="Set a new password">
      <div className="max-w-md space-y-6">
        {token ? (
          <>
            <ResetPasswordForm token={token} onSubmit={completePasswordResetAction} />
            <Link href="/login" className="inline-block text-sm font-medium underline underline-offset-4">Go to sign-in</Link>
          </>
        ) : (
          <p>This reset link is missing its token. <Link href="/forgot-password" className="underline underline-offset-4">Request a new link</Link>.</p>
        )}
      </div>
    </PageShell>
  );
}
