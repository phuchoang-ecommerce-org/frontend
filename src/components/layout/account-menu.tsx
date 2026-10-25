"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import type { NavigationLink } from "./types";
import { focusRing } from "../ui/styles";

export type AccountMenuProps = {
  displayName: string;
  links: NavigationLink[];
  onSignOut: () => void;
};

export function AccountMenu({
  displayName,
  links,
  onSignOut,
}: AccountMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={`inline-flex min-h-control items-center gap-1 rounded-control border border-control-border bg-surface px-2 font-ui text-sm font-medium text-primary hover:border-primary ${focusRing}`}
      >
        {displayName}
        <ChevronDown size={16} aria-hidden="true" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-12 rounded-card border border-border bg-surface p-1 font-ui shadow-sm"
        >
          {links.map((link) => (
            <DropdownMenu.Item key={link.href} asChild>
              <Link
                href={link.href}
                className={`flex min-h-control items-center rounded-control px-2 text-sm text-ink outline-hidden data-[highlighted]:bg-soft ${focusRing}`}
              >
                {link.label}
              </Link>
            </DropdownMenu.Item>
          ))}
          {links.length > 0 && (
            <DropdownMenu.Separator className="my-1 border-t border-border" />
          )}
          <DropdownMenu.Item
            onSelect={onSignOut}
            className={`flex min-h-control cursor-default items-center rounded-control px-2 text-sm text-primary outline-hidden data-[highlighted]:bg-soft ${focusRing}`}
          >
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
