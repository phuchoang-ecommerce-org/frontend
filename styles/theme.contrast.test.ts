import { hex } from "wcag-contrast";
import { describe, expect, it } from "vitest";

/**
 * ADR-0022 §4 — measured, not eyeballed. Every foreground/background pair the
 * design system ships must meet its documented WCAG level.
 */
const tokens = {
  background: "#F8F8F6",
  surface: "#FFFFFF",
  primary: "#1E3A5F",
  accent: "#6B8E7A",
  border: "#E5E5E5",
};

const AA_NORMAL_TEXT = 4.5;

describe("Ma design tokens — contrast (ADR-0022 §4)", () => {
  it("primary on background passes AA for body text", () => {
    expect(hex(tokens.primary, tokens.background)).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT,
    );
  });

  it("primary on surface passes AA for body text", () => {
    expect(hex(tokens.primary, tokens.surface)).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT,
    );
  });

  it("accent on surface does NOT meet AA for body text — restricted to large text, borders, and non-text indicators", () => {
    expect(hex(tokens.accent, tokens.surface)).toBeLessThan(AA_NORMAL_TEXT);
  });
});
