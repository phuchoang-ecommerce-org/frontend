import {
  FacetPanelSkeleton,
  ProductGridSkeleton,
} from "@/features/catalog/components/catalog-skeletons";

export default function CategoryLoading() {
  return (
    <main className="mx-auto w-full max-w-content px-4 py-6" aria-busy="true">
      <div className="h-16" />
      <div className="mt-4 grid gap-4 lg:grid-cols-catalog">
        <FacetPanelSkeleton />
        <ProductGridSkeleton />
      </div>
    </main>
  );
}
