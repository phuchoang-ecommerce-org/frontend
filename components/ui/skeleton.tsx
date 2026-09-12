import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Loading placeholder. `aria-hidden` because a skeleton has no content of its
 * own to announce — the loading state belongs to an ancestor `role="status"`
 * region, not to each individual skeleton node (ADR-0026, accessibility baseline).
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-control bg-neutral-100 transition-colors duration-150",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
