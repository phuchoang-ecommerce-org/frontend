import { SectionSkeleton } from "@/components/ui/section-state";

export default function AuthLoading() {
  return (
    <main className="mx-auto w-full max-w-content px-4 py-8" aria-busy="true">
      <SectionSkeleton className="mx-auto max-w-lg" lines={5} />
    </main>
  );
}
