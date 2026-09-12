import { Skeleton } from "@/components/ui/skeleton";

// Field-shaped skeleton, sized to ProfileForm's actual field count — not a
// generic spinner and not sized from a count that may be absent (Routing.md §8).
export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Loading profile">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-control w-32" />
    </div>
  );
}
