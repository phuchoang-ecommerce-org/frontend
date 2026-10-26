import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = { title: "Welcome | ECP" };

export default async function WelcomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-12">
      <section className="w-full max-w-xl rounded-2xl border border-stone-200 bg-white p-8 shadow-sm sm:p-12">
        <div className="mb-10 flex size-12 items-center justify-center rounded-xl bg-emerald-950 text-xl font-bold text-white">
          E
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-800">
          Signed in
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
          Welcome to this.
        </h1>
        <p className="mt-5 text-base leading-7 text-stone-600">
          You are signed in as{" "}
          <strong className="font-semibold text-stone-900">
            {session.account.displayName || session.account.email}
          </strong>
          .
        </p>
        <p className="mt-2 text-sm text-stone-500">
          This page is a placeholder for your commerce workspace.
        </p>
        <div className="mt-10 border-t border-stone-200 pt-7">
          <SignOutButton />
        </div>
      </section>
    </main>
  );
}
