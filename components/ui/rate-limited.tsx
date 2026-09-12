"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface RateLimitedProps {
  /** Seconds until retry is allowed — from the `Retry-After` response header. */
  retryAfterSeconds?: number;
  onRetry: () => void;
  className?: string;
}

/**
 * The dedicated 429 screen (US-AUD-04/FE) — a designed retry affordance,
 * never the generic error boundary. Follows EmptyState's pattern (`UI
 * Design System.md` §13: concise explanation, one primary action, small
 * icon) but built separately since the retry action needs a disabled state
 * EmptyState's action prop doesn't support.
 */
function RateLimited({ retryAfterSeconds, onRetry, className }: RateLimitedProps) {
  // Lazy initializer, not an effect-driven sync: this component is mounted
  // fresh for each 429 episode (the caller conditionally renders it), so
  // there's no later prop change to reconcile after mount.
  const [remaining, setRemaining] = useState(() => retryAfterSeconds ?? 0);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((seconds) => Math.max(0, seconds - 1)), 1_000);
    return () => clearTimeout(timer);
  }, [remaining]);

  const disabled = remaining > 0;

  return (
    <div
      role="status"
      data-slot="rate-limited"
      className={cn(
        "flex flex-col items-center gap-2 rounded-card border border-border bg-surface p-6 text-center",
        className,
      )}
    >
      <Clock aria-hidden="true" className="size-icon text-neutral-500" />
      <p className="text-sm font-medium text-primary">Too many attempts.</p>
      <p className="text-sm text-neutral-700">
        {disabled ? `Please try again in ${remaining}s.` : "You can try again now."}
      </p>
      <Button type="button" onClick={onRetry} disabled={disabled} aria-disabled={disabled}>
        {disabled ? `Retry in ${remaining}s` : "Try again"}
      </Button>
    </div>
  );
}

export { RateLimited };
