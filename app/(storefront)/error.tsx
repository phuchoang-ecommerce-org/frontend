"use client";

// A server exception object must never reach a client-rendered error
// boundary (Security.md §8.4) — Next.js's `error` prop already strips the
// stack in production, and we render no message from it, only the
// correlation id we can recover from the environment. No response body.
export default function StorefrontError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-content px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-primary">
        Something went wrong
      </h1>
      <p className="mt-2 text-neutral-700">
        Please try again. If this keeps happening, mention this reference:{" "}
        {error.digest ?? "unavailable"}
      </p>
    </div>
  );
}
