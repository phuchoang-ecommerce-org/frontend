import { SectionSkeleton } from "@/components/ui/section-state";

export default function StorefrontLoading() {
  return (
    <main className="mx-auto w-full max-w-content px-4 py-6" aria-busy="true">
      <SectionSkeleton lines={4} />
    </main>
  );
}
