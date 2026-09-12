import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "./button";

/**
 * Cursor-only pagination (Data Fetching.md §8) — this component never reads
 * or constructs a cursor itself. The caller passes `page.next` through
 * untouched as an opaque href; there is no page-number affordance and no
 * "N of total" copy, since `total` is optional across this API.
 */
export interface PaginationControlProps {
  count: number;
  hasNext: boolean;
  nextHref?: string | undefined;
  previousHref?: string | undefined;
  className?: string | undefined;
}

function PaginationControl({ count, hasNext, nextHref, previousHref, className }: PaginationControlProps) {
  return (
    <nav
      aria-label="Pagination"
      data-slot="pagination"
      className={cn("flex items-center justify-between gap-4 pt-4", className)}
    >
      <p className="text-sm text-neutral-700">Showing {count} results</p>
      <div className="flex gap-2">
        <Button asChild={Boolean(previousHref)} variant="outline" size="sm" disabled={!previousHref}>
          {previousHref ? <Link href={previousHref}>Previous</Link> : <span>Previous</span>}
        </Button>
        <Button asChild={Boolean(hasNext && nextHref)} variant="outline" size="sm" disabled={!hasNext || !nextHref}>
          {hasNext && nextHref ? <Link href={nextHref}>Next</Link> : <span>Next</span>}
        </Button>
      </div>
    </nav>
  );
}

export { PaginationControl };
