import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { focusRing } from "@/components/ui/styles";
import {
  cursorPaginationHrefs,
  type CursorPage,
} from "../pagination";

const controlClass =
  "inline-flex min-h-control items-center gap-1 rounded-control border border-border px-3 text-sm font-medium";

function DisabledControl({
  direction,
}: {
  direction: "previous" | "next";
}) {
  return (
    <span
      aria-disabled="true"
      className={`${controlClass} cursor-not-allowed opacity-50`}
    >
      {direction === "previous" && <ChevronLeft aria-hidden="true" size={16} />}
      {direction === "previous" ? "Previous" : "Next"}
      {direction === "next" && <ChevronRight aria-hidden="true" size={16} />}
    </span>
  );
}

export function CatalogPagination({
  basePath,
  page,
  nextCursor,
}: {
  basePath: string;
  page: CursorPage;
  nextCursor?: string | undefined;
}) {
  const { previousHref, nextHref } = cursorPaginationHrefs(
    basePath,
    page,
    nextCursor,
  );
  if (!previousHref && !nextHref) return null;

  return (
    <nav aria-label="Product pages">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="justify-self-start">
          {previousHref ? (
            <Link
              href={previousHref}
              aria-label="Go to previous products page"
              className={`${controlClass} hover:bg-soft ${focusRing}`}
            >
              <ChevronLeft aria-hidden="true" size={16} />
              Previous
            </Link>
          ) : (
            <DisabledControl direction="previous" />
          )}
        </div>
        <span
          aria-current="page"
          className="text-sm tabular-nums text-muted-foreground"
        >
          Page {page.pageNumber}
        </span>
        <div className="justify-self-end">
          {nextHref ? (
            <Link
              href={nextHref}
              aria-label="Go to next products page"
              className={`${controlClass} hover:bg-soft ${focusRing}`}
            >
              Next
              <ChevronRight aria-hidden="true" size={16} />
            </Link>
          ) : (
            <DisabledControl direction="next" />
          )}
        </div>
      </div>
    </nav>
  );
}
