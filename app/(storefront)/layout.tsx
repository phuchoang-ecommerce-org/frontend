import type { ReactNode } from "react";

import { Footer, Header } from "@/components/layout";

// Optional session, Lax cookie (Routing.md §2). Cart count will come from a
// features/cart query once that feature exists — the header takes it as a
// prop (rule I-5: components/layout never fetches).
export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
