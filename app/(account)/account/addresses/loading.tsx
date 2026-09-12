import { Skeleton } from "@/components/ui/skeleton";

// Table-shaped skeleton — a few rows at the Table primitive's own row height, not a full-page spinner.
export default function AddressesLoading() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Loading addresses">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-control w-32" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}
