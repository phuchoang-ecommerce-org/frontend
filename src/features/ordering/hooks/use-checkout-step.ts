"use client";

import { useState } from "react";

export function useCheckoutStep(steps: string[], firstUnfinishedStep: number) {
  const [step, setStep] = useState(
    Math.max(0, Math.min(firstUnfinishedStep, steps.length - 1)),
  );
  return {
    step,
    back: () => setStep((current) => Math.max(0, current - 1)),
    next: () => setStep((current) => Math.min(steps.length - 1, current + 1)),
    goTo: (index: number) =>
      setStep(Math.max(0, Math.min(index, steps.length - 1))),
  };
}
