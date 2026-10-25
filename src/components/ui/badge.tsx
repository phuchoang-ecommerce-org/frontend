export type BadgeProps = { label: string; kind?: "info" | "success" | "error" };

const styles = {
  info: "border-border bg-soft",
  success: "border-accent bg-surface",
  error: "border-primary bg-surface",
};

export function Badge({ label, kind = "info" }: BadgeProps) {
  return (
    <span
      className={`inline-flex min-h-3 items-center rounded-control border px-1 font-ui text-sm font-medium text-ink ${styles[kind]}`}
    >
      {label}
    </span>
  );
}
