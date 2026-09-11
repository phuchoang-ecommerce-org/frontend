import Link from "next/link";

const ACCOUNT_LINKS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/settings", label: "Settings" },
] as const;

export function AccountSidebar() {
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
    </nav>
  );
}
