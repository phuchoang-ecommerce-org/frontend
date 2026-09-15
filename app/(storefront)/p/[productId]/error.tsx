"use client";

export default function ProductError({ reset }: { reset: () => void }) {
  return (
    <main className="py-16 mx-auto w-full max-w-content px-4 text-center">
      <h1 className="text-2xl font-semibold text-primary">
        We couldn&apos;t load this product
      </h1>
      <p className="mt-2 text-neutral-700">Please try again shortly.</p>
      <button
        className="mt-4 min-h-control rounded-control bg-primary px-3 text-sm font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </main>
  );
}
