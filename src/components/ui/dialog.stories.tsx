import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, userEvent, waitFor } from "storybook/test";
import { Dialog } from "./dialog";
import { Button } from "./button";
import { TextField } from "./text-field";

const meta = { title: "Shared UI/Dialog", component: Dialog, args: { open: false, title: "Add address", onOpenChange: () => {}, children: null } } satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;
function Example() { const [open, setOpen] = useState(false); const [street, setStreet] = useState(""); return <Dialog open={open} onOpenChange={setOpen} title="Add address" description="Save an address for future orders." trigger={<Button>Add address</Button>}><div className="grid gap-3"><TextField name="street" label="Street address" value={street} onChange={setStreet} /><Button onClick={() => setOpen(false)}>Save address</Button></div></Dialog>; }
export const EditablePanel: Story = { render: () => <Example />, play: async ({ canvas }) => { const trigger = canvas.getByRole("button", { name: "Add address" }); await userEvent.click(trigger); await expect(await screen.findByRole("dialog", { name: "Add address" })).toBeVisible(); await userEvent.keyboard("{Escape}"); await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument()); await waitFor(() => expect(trigger).toHaveFocus()); } };
