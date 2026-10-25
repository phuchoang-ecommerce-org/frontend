import Link from "next/link";
import type { NavigationLink } from "./types";
import { focusRing } from "../ui/styles";

export type StaffNavProps = { links: NavigationLink[] };

export function StaffNav({ links }: StaffNavProps) {
  return (
    <nav
      aria-label="Staff"
      className="border-b border-border bg-surface font-ui"
    >
      <ul className="mx-auto flex max-w-content flex-wrap gap-x-4 gap-y-1 px-3 sm:px-4 lg:px-6">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`inline-flex min-h-control items-center rounded-control px-1 text-sm font-medium text-primary hover:underline ${focusRing}`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
