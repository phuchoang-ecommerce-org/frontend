// Deliberately unexplained (Routing.md §8): ownership 404 must be
// indistinguishable from absence.
export default function StorefrontNotFound() {
  return (
    <div className="mx-auto max-w-content px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-primary">Not found</h1>
      <p className="mt-2 text-neutral-700">
        We couldn&apos;t find what you were looking for.
      </p>
    </div>
  );
}
