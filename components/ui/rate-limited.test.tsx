import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RateLimited } from "./rate-limited";

describe("RateLimited", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("disables retry and counts down while retryAfterSeconds hasn't elapsed", () => {
    render(<RateLimited retryAfterSeconds={5} onRetry={vi.fn()} />);
    expect(screen.getByRole("button", { name: /retry in 5s/i })).toBeDisabled();
  });

  it("re-enables the retry action once the countdown reaches zero", () => {
    vi.useFakeTimers();
    render(<RateLimited retryAfterSeconds={2} onRetry={vi.fn()} />);
    expect(screen.getByRole("button")).toBeDisabled();

    // Advanced in two separate acts, one per tick: the countdown
    // re-schedules its setTimeout from inside the effect, so each tick's
    // React commit needs to land before the next second can be simulated.
    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(screen.getByRole("button", { name: /try again/i })).toBeEnabled();
  });

  it("calls onRetry when the enabled action is activated", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<RateLimited retryAfterSeconds={0} onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("announces via role=status without requiring focus", () => {
    render(<RateLimited retryAfterSeconds={0} onRetry={vi.fn()} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<RateLimited retryAfterSeconds={0} onRetry={vi.fn()} />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
