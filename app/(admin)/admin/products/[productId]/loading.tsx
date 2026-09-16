import { SectionSkeleton } from "@/components/ui/section-state";

export default function ProductDetailLoading() {
  return (
    <div
      className="flex flex-col gap-4"
      aria-busy="true"
      aria-label="Loading product"
    >
      <SectionSkeleton lines={6} />
      <SectionSkeleton lines={5} />
      <SectionSkeleton lines={4} />
    </div>
  );
}
