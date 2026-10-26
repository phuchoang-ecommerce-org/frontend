import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout";
import { RegisterForm } from "@/features/identity/components";
import { registerAction } from "@/features/identity/server/guest-actions";

export const metadata: Metadata = { title: "Create account | ECP" };

export default function RegisterPage() {
  return (
    <PageShell title="Create account">
      <div className="max-w-md space-y-6">
        <p>
          Create an account to continue from your guest cart. We’ll send a
          verification link to your email.
        </p>
        <RegisterForm onSubmit={registerAction} />
        <p className="text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
