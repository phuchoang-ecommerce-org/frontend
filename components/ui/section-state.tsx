import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

import { Skeleton } from "./skeleton";

export function SectionSkeleton({
  className,
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <section
      aria-busy="true"
      aria-label="Loading section"
      className={cn(
        "rounded-card border border-border bg-surface p-4",
        className,
      )}
    >
      <Skeleton className="h-5 w-32" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: lines }, (_, index) => (
          <Skeleton key={index} className="h-4 w-full last:w-3/4" />
        ))}
      </div>
    </section>
  );
}

export function SectionEmpty({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-card border border-border bg-surface p-4",
        className,
      )}
      role="status"
    >
      <AlertCircle aria-hidden="true" className="size-icon text-neutral-500" />
      <h2 className="mt-2 text-base font-medium text-primary">{title}</h2>
      <p className="mt-1 text-sm text-neutral-700">{description}</p>
    </section>
  );
}
