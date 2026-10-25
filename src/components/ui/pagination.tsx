"use client";

import { Button } from "./button";

export type PaginationProps = {
  hasNext: boolean;
  hasPrevious: boolean;
  pageLabel: string;
  onNext: () => void;
  onPrevious: () => void;
};

export function Pagination({
  hasNext,
  hasPrevious,
  pageLabel,
  onNext,
  onPrevious,
}: PaginationProps) {
  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-2 font-ui"
    >
      <Button variant="secondary" disabled={!hasPrevious} onClick={onPrevious}>
        Previous
      </Button>
      <span aria-live="polite" className="text-sm font-medium text-ink">
        {pageLabel}
      </span>
      <Button variant="secondary" disabled={!hasNext} onClick={onNext}>
        Next
      </Button>
    </nav>
  );
}
