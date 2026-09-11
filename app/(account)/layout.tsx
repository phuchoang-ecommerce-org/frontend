import type { ReactNode } from "react";

import { AccountSidebar, Footer, Header } from "@/components/layout";

// Required session (CUSTOMER), Lax cookie — storefront shell + account
// sidebar (Routing.md §2). proxy.ts redirects unauthenticated requests here
// away to /sign-in before this ever renders; this layout does not
// re-check auth (that's the middleware's job, and ecp-api's on every read —
// Security.md §13).
export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <div className="mx-auto flex max-w-content gap-6 px-4 py-6">
        <AccountSidebar />
        <main className="flex-1">{children}</main>
      </div>
      <Footer />
    </>
  );
}
