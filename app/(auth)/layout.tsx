import type { ReactNode } from "react";
import Link from "next/link";

// No session by construction, Lax cookie, minimal shell — no navigation
// (Routing.md §2).
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-full max-w-sm flex-col justify-center px-4 py-16">
      <Link href="/" className="mb-8 text-lg font-semibold text-primary">
        ECP
      </Link>
      {children}
    </main>
  );
}
