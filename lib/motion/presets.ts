import type { Transition, Variants } from "framer-motion";

/**
 * ADR-0026 — exactly five named motion presets, no others. Every duration/ease
 * pair mirrors the tokens in styles/theme.css so a change to one is a change
 * to both; there is no third source of truth for a duration.
 */
function tween(durationSeconds: number): Transition {
  return { type: "tween", ease: [0, 0, 0.2, 1], duration: durationSeconds };
}

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: tween(0.15) },
};

export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: tween(0.2) },
};

export const colorShift: Transition = tween(0.15);

export const elevate: Variants = {
  rest: { boxShadow: "0 0 0 rgba(0,0,0,0)" },
  hover: { boxShadow: "0 4px 12px rgba(0,0,0,0.08)", transition: tween(0.2) },
};

export const overlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: tween(0.25) },
};

/**
 * Strips a preset to its opacity-only end state for prefers-reduced-motion —
 * callers pass this result to framer-motion's `transition` prop as an
 * override rather than duplicating the reduced-motion branch at every call
 * site.
 */
export function reducedMotionTransition(): Transition {
  return { duration: 0.00001 };
}
