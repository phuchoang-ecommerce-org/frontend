import Link from "next/link";
import type { NavigationLink } from "./types";
import { focusRing } from "../ui/styles";

export type BreadcrumbsProps = { items: NavigationLink[] };

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="font-ui text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => (
          <li key={`${item.href}-${index}`} className="flex items-center gap-1">
            {index > 0 && <span aria-hidden="true">/</span>}
            {index === items.length - 1 ? (
              <span aria-current="page" className="font-medium text-ink">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className={`inline-flex min-h-control items-center rounded-control px-1 text-primary underline-offset-4 hover:underline ${focusRing}`}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
