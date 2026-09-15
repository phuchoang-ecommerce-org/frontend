import { SectionSkeleton } from "@/components/ui/section-state";

export default function ProductLoading() {
  return (
    <main className="mx-auto w-full max-w-content px-4 py-6" aria-busy="true">
      <div className="grid gap-4 lg:grid-cols-product-detail">
        <SectionSkeleton className="aspect-square" lines={0} />
        <SectionSkeleton lines={6} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SectionSkeleton />
        <SectionSkeleton />
      </div>
    </main>
  );
}
