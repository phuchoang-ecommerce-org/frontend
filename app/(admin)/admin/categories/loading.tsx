import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesLoading() {
  return (
    <div
      className="flex flex-col gap-4"
      aria-busy="true"
      aria-label="Loading categories"
    >
      <Skeleton className="w-32 h-8" />
      <Skeleton className="h-16 w-full" />
      <div className="space-y-2 rounded-card border border-border bg-surface p-4">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}
