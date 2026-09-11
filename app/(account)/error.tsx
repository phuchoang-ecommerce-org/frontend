"use client";

export default function AccountError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-primary">
        Something went wrong
      </h1>
      <p className="mt-2 text-neutral-700">
        Reference: {error.digest ?? "unavailable"}
      </p>
    </div>
  );
}
