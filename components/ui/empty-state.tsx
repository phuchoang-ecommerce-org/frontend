import * as React from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action: EmptyStateAction;
  className?: string;
}

/**
 * ADR-0026 §13 — concise explanation, one primary action, a small supporting
 * icon, no oversized illustration. `role="status"` so the message (e.g. a
 * non-disclosive sign-in failure) is announced without requiring focus.
 */
function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      role="status"
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center gap-2 rounded-card border border-border bg-surface p-6 text-center transition-opacity duration-150",
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-icon text-neutral-500" />
      <p className="text-sm font-medium text-primary">{title}</p>
      {description && <p className="text-sm text-neutral-700">{description}</p>}
      {action.href ? (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : (
        <Button type="button" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export { EmptyState };
