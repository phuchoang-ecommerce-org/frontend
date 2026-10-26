import { Badge as PrimitiveBadge } from "./primitives/badge";

export type BadgeProps = { label: string; kind?: "info" | "success" | "error" };

export function Badge({ label, kind = "info" }: BadgeProps) {
  return (
    <PrimitiveBadge variant={kind === "info" ? "secondary" : kind === "success" ? "outline" : "destructive"}>
      {label}
    </PrimitiveBadge>
  );
}
