import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import { Modal, ModalContent, ModalDescription, ModalTitle } from "./modal";

function renderOpenModal() {
  return render(
    <Modal open>
      <ModalContent>
        <ModalTitle>Add address</ModalTitle>
        <ModalDescription>Enter a new shipping address.</ModalDescription>
      </ModalContent>
    </Modal>,
  );
}

describe("Modal", () => {
  it("renders its title when open", () => {
    renderOpenModal();
    expect(screen.getByRole("dialog", { name: "Add address" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = renderOpenModal();
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
