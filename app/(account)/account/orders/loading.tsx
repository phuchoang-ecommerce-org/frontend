import { Skeleton } from "@/components/ui/skeleton";

// Table-shaped, not empty-shaped — loading can't know in advance whether the
// result will turn out empty (Data Fetching.md §8).
export default function OrdersLoading() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Loading orders">
      <Skeleton className="h-8 w-32" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}
