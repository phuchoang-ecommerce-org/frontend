import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/identity/components/identity-forms";
import { DevAccountLoginPanel } from "@/features/identity/components/dev-account-login-panel";
import {
  devAccounts,
  devLoginEnabled,
} from "@/features/identity/server/dev-config";
import { devLoginAction } from "@/features/identity/server/dev-login";
import { loginAction } from "@/features/identity/server/login";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in | ECP" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const requested = (await searchParams).returnTo;
  const returnTo =
    requested?.startsWith("/") &&
    !requested.startsWith("//") &&
    !requested.includes("\\")
      ? requested
      : "/welcome";
  if (await getSession()) redirect(returnTo);

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-6 text-stone-950 sm:py-16 [&_button]:min-h-11 [&_input]:h-11">
      <div className="mx-auto grid w-full max-w-5xl overflow-clip rounded-2xl border border-stone-200 bg-white shadow-sm lg:min-h-[660px] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="flex min-w-0 flex-col justify-between bg-emerald-950 px-6 py-7 text-white sm:px-10 lg:px-12 lg:py-12">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-white/25 text-lg font-bold">
              E
            </div>
            <span className="text-sm font-semibold tracking-[0.2em]">ECP</span>
          </div>
          <div className="mt-8 max-w-sm lg:mt-0">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-200">
              Your account
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Welcome back.
            </h1>
            <p className="mt-3 text-base leading-6 text-emerald-100">
              Sign in to continue to your commerce workspace.
            </p>
          </div>
          <p className="mt-6 text-sm text-emerald-200 lg:mt-12">
            Enterprise Commerce Platform
          </p>
        </aside>
        <div className="flex min-w-0 flex-col justify-center px-6 py-8 sm:px-12 lg:px-16">
          <div className="mx-auto w-full min-w-0 max-w-md">
            <p className="text-sm font-semibold text-emerald-800">
              ACCOUNT ACCESS
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Sign in
            </h2>
            <p className="mt-2 mb-8 text-sm leading-6 text-stone-600">
              Enter your account email and password.
            </p>
            <LoginForm onSubmit={loginAction} successHref={returnTo} />
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link
                href="/register"
                className="font-medium underline underline-offset-4"
              >
                Create an account
              </Link>
              <Link
                href="/forgot-password"
                className="font-medium underline underline-offset-4"
              >
                Forgot password?
              </Link>
            </div>
            {devLoginEnabled() && (
              <div className="mt-9 border-t border-stone-200 pt-7">
                <DevAccountLoginPanel
                  accounts={[...devAccounts]}
                  onSelect={devLoginAction}
                  returnTo={returnTo}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
