"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type PaymentStatusRefreshOptions = {
  intervalMs?: number;
  maxRefreshes?: number;
};

/**
 * Refresh an uncertain payment result a bounded number of times. Refreshing is
 * deliberately paused while the tab is hidden: it is a read-only convenience,
 * not a background job or a reason to create another payment attempt.
 */
export function usePaymentStatusRefresh(
  pending: boolean,
  { intervalMs = 5_000, maxRefreshes = 12 }: PaymentStatusRefreshOptions = {},
) {
  const router = useRouter();
  const refreshes = useRef(0);
  const [pollingStopped, setPollingStopped] = useState(false);

  const checkNow = useCallback(() => router.refresh(), [router]);

  useEffect(() => {
    if (!pending) {
      refreshes.current = 0;
      return;
    }

    let timer: number | undefined;
    const schedule = () => {
      if (document.visibilityState === "hidden") return;
      if (refreshes.current >= maxRefreshes) {
        setPollingStopped(true);
        return;
      }
      timer = window.setTimeout(() => {
        refreshes.current += 1;
        router.refresh();
        schedule();
      }, intervalMs);
    };
    const onVisibilityChange = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      timer = undefined;
      if (document.visibilityState === "visible") schedule();
    };

    schedule();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pending, intervalMs, maxRefreshes, router]);

  return { checkNow, pollingStopped };
}
