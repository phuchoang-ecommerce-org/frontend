"use client";

import { useReportWebVitals } from "next/web-vitals";

type WebVitalMetric = { name: string };

const reportWebVital = (metric: WebVitalMetric) => {
  if (!["LCP", "CLS", "INP"].includes(metric.name)) return;
  window.dispatchEvent(new CustomEvent("ecp:web-vital", { detail: metric }));
};

/** Reports the R1 experience metrics to the browser's observability channel. */
export function WebVitalsReporter() {
  useReportWebVitals(reportWebVital);
  return null;
}
