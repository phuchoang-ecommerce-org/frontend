import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, userEvent } from "storybook/test";
import { AlertDialog } from "./alert-dialog";
import { Button } from "./button";

const meta = {
  title: "Shared UI/AlertDialog",
  component: AlertDialog,
  args: {
    open: false,
    title: "Remove address?",
    message: "This address will be removed from your account.",
    onConfirm: () => {},
    onCancel: () => {},
  },
} satisfies Meta<typeof AlertDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Remove address
      </Button>
      <AlertDialog
        open={open}
        title="Remove address?"
        message="This address will be removed from your account."
        confirmLabel="Remove address"
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
export const Confirmation: Story = {
  render: () => <Example />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Remove address" });
    await userEvent.click(trigger);
    await expect(
      await screen.findByRole("alertdialog", { name: "Remove address?" }),
    ).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};
