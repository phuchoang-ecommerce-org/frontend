import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { SectionEmpty, SectionSkeleton } from "./section-state";

describe("section fallback states", () => {
  it("keeps loading placeholders out of the accessibility tree", async () => {
    const { getByLabelText, container } = render(<SectionSkeleton lines={2} />);
    expect(getByLabelText("Loading section")).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it("provides a labelled, composed empty section", async () => {
    const { getByRole, container } = render(
      <SectionEmpty
        description="Try again later."
        title="Reviews unavailable"
      />,
    );
    expect(getByRole("status")).toHaveTextContent("Reviews unavailable");
    expect((await axe(container)).violations).toHaveLength(0);
  });
});
