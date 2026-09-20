import type { ReactNode } from "react";

import { AccountSidebar, Footer, Header } from "@/components/layout";
import { signOutFromAccount } from "@/features/identity/server/account-layout-actions";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <div className="mx-auto flex max-w-content gap-6 px-4 py-6">
        <AccountSidebar signOutAction={signOutFromAccount} />
        <main className="flex-1">{children}</main>
      </div>
      <Footer />
    </>
  );
}
