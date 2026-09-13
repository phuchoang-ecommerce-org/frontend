import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridSkeleton() {
  return (
    <div
      aria-label="Loading products"
      className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="rounded-card border border-border bg-surface p-2"
        >
          <Skeleton className="h-24 w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-1 h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function FacetPanelSkeleton() {
  return (
    <aside
      aria-label="Loading filters"
      className="rounded-card border border-border bg-surface p-2"
    >
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 mt-2 w-full" />
    </aside>
  );
}
