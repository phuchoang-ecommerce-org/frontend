"use client";

import { useReportWebVitals } from "next/web-vitals";

/** Reports the R1 experience metrics to the browser's observability channel. */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (!["LCP", "CLS", "INP"].includes(metric.name)) return;
    window.dispatchEvent(new CustomEvent("ecp:web-vital", { detail: metric }));
  });
  return null;
}
