import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";
import { TextField, type TextFieldProps } from "./text-field";

const meta = { title: "Shared UI/TextField", component: TextField, args: { name: "email", label: "Email address", type: "email", value: "", autoComplete: "email", onChange: () => {} } } satisfies Meta<typeof TextField>;
export default meta;
type Story = StoryObj<typeof meta>;
function Example(props: TextFieldProps) { const [value, setValue] = useState(props.value); return <div className="max-w-md"><TextField {...props} value={value} onChange={setValue} /></div>; }
export const Default: Story = { render: (args) => <Example {...args} />, play: async ({ canvas }) => { const field = canvas.getByRole("textbox", { name: "Email address" }); await userEvent.type(field, "mai@example.com"); await expect(field).toHaveValue("mai@example.com"); } };
export const Required: Story = { args: { required: true, hint: "We will send order updates here." }, render: (args) => <Example {...args} /> };
export const Error: Story = { args: { value: "invalid", error: "Enter a valid email address." }, render: (args) => <Example {...args} />, play: async ({ canvas }) => { const field = canvas.getByRole("textbox", { name: "Email address" }); await expect(field).toHaveAttribute("aria-invalid", "true"); await expect(field).toHaveAccessibleDescription("Enter a valid email address."); } };
