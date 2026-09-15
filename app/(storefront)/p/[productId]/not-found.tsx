import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="py-16 mx-auto w-full max-w-content px-4 text-center">
      <h1 className="text-2xl font-semibold text-primary">
        Product unavailable
      </h1>
      <p className="mt-2 text-neutral-700">
        We couldn&apos;t find that product.
      </p>
      <Link
        className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        href="/"
      >
        Browse the catalog
      </Link>
    </main>
  );
}
