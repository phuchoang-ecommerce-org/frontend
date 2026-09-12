import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CsrfField } from "@/components/ui/csrf-field";

const ACCOUNT_LINKS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/security", label: "Security" },
] as const;

export interface AccountSidebarProps {
  /**
   * Sign-out as an account-menu action, not a route (US-CUS-04). Injected
   * rather than imported directly — components/layout may not import
   * features/* (rule I-5), so the caller (app/(account)/layout.tsx) supplies
   * features/identity's logOut.
   */
  signOutAction?: (formData: FormData) => Promise<void>;
}

export function AccountSidebar({ signOutAction }: AccountSidebarProps) {
  return (
    <nav aria-label="Account" className="flex flex-col gap-1 border-r border-border pr-4">
      {ACCOUNT_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-control px-3 py-2 text-sm text-neutral-900 hover:bg-neutral-50"
        >
          {link.label}
        </Link>
      ))}
      {signOutAction ? (
        <form action={signOutAction}>
          <CsrfField />
          <Button type="submit" variant="ghost" className="w-full justify-start px-3">
            Sign out
          </Button>
        </form>
      ) : null}
    </nav>
  );
}
