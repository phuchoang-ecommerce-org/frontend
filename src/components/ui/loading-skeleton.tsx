export type LoadingSkeletonProps = {
  shape: "text" | "card" | "row";
  count?: number;
};

const shapes = {
  text: "h-2 w-full rounded-control",
  card: "h-12 w-full rounded-card",
  row: "h-6 w-full rounded-control",
};

export function LoadingSkeleton({ shape, count = 1 }: LoadingSkeletonProps) {
  return (
    <div role="status" aria-label="Loading content" className="grid gap-2">
      {Array.from({ length: Math.max(1, count) }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className={`${shapes[shape]} bg-soft`}
        />
      ))}
      <span className="sr-only">Loading content</span>
    </div>
  );
}
