import { CheckCircle2, MailCheck } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { verifyEmailAddress } from "@/features/identity/server/actions";

import { ResendVerificationForm } from "./resend-verification-form";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-primary">Verify your email</h1>
        <ResendVerificationForm />
      </div>
    );
  }

  const result = await verifyEmailAddress({ token });

  if (result.ok) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="Email verified."
        action={{ label: "Sign in", href: "/sign-in" }}
      />
    );
  }

  // The contract's accountVerifications responses carry only 400/404/429 —
  // no code distinguishes an expired token from an unknown one (see the
  // TODO in lib/api/error-map.ts) — so this copy stays generic for both.
  return (
    <div className="flex flex-col gap-4">
      <EmptyState
        icon={MailCheck}
        title="This link may have expired or already been used."
        action={{ label: "Request a new link", href: "/verify-email" }}
      />
    </div>
  );
}
