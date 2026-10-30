"use client";

import { Button } from "./button";
import {
  Pagination as PrimitivePagination,
  PaginationContent,
  PaginationItem,
} from "./primitives/pagination";

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
    <PrimitivePagination aria-label="Pagination">
      <PaginationContent>
        <PaginationItem>
          <Button
            variant="secondary"
            disabled={!hasPrevious}
            onClick={onPrevious}
          >
            Previous
          </Button>
        </PaginationItem>
        <PaginationItem>
          <span aria-live="polite">{pageLabel}</span>
        </PaginationItem>
        <PaginationItem>
          <Button variant="secondary" disabled={!hasNext} onClick={onNext}>
            Next
          </Button>
        </PaginationItem>
      </PaginationContent>
    </PrimitivePagination>
  );
}
