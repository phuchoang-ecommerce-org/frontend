"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function usePaymentStatusRefresh(pending: boolean, intervalMs = 5000) {
  const router = useRouter();
  useEffect(() => {
    if (!pending) return;
    const timer = window.setInterval(() => router.refresh(), intervalMs);
    return () => window.clearInterval(timer);
  }, [pending, intervalMs, router]);
}
