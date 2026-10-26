import type { CSSProperties } from "react";
import { Skeleton } from "./primitives/skeleton";

export type LoadingSkeletonProps = {
  shape: "text" | "card" | "row";
  count?: number;
};

const shapes: Record<LoadingSkeletonProps["shape"], CSSProperties> = {
  text: { height: 8, width: "100%" },
  card: { height: 48, width: "100%" },
  row: { height: 24, width: "100%" },
};

export function LoadingSkeleton({ shape, count = 1 }: LoadingSkeletonProps) {
  return (
    <div role="status" aria-label="Loading content" className="grid gap-2">
      {Array.from({ length: Math.max(1, count) }, (_, index) => (
        <Skeleton
          key={index}
          aria-hidden="true"
          style={shapes[shape]}
        />
      ))}
      <span className="sr-only">Loading content</span>
    </div>
  );
}
