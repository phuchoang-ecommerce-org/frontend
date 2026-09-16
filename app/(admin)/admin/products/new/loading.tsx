import { Skeleton } from "@/components/ui/skeleton";

export default function NewProductLoading() {
  return (
    <div
      className="p-5 max-w-3xl rounded-card border border-border bg-surface"
      aria-busy="true"
      aria-label="Loading product form"
    >
      <Skeleton className="w-40 h-8" />
      <div className="mt-5 space-y-4">
        <Skeleton className="h-control-sm w-full" />
        <Skeleton className="h-control-sm w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="w-32 h-control" />
      </div>
    </div>
  );
}
