import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, userEvent, waitFor } from "storybook/test";
import { SelectField, type SelectFieldProps } from "./select-field";

const options = [{ value: "north", label: "North warehouse" }, { value: "south", label: "South warehouse" }, { value: "central", label: "Central warehouse", disabled: true }];
const meta = { title: "Shared UI/SelectField", component: SelectField, args: { name: "warehouse", label: "Warehouse", value: "north", options, onChange: () => {} } } satisfies Meta<typeof SelectField>;
export default meta;
type Story = StoryObj<typeof meta>;
function Example(props: SelectFieldProps) { const [value, setValue] = useState(props.value); return <div className="max-w-md"><SelectField {...props} value={value} onChange={setValue} /></div>; }
export const Default: Story = { render: (args) => <Example {...args} />, play: async ({ canvas }) => { const trigger = canvas.getByRole("combobox", { name: "Warehouse" }); await userEvent.click(trigger); await userEvent.click(await screen.findByRole("option", { name: "South warehouse" })); await waitFor(() => expect(trigger).toHaveTextContent("South warehouse")); } };
export const Error: Story = { args: { value: "", error: "Choose a warehouse." }, render: (args) => <Example {...args} />, play: async ({ canvas }) => { const field = canvas.getByRole("combobox", { name: "Warehouse" }); await expect(field).toHaveAttribute("aria-invalid", "true"); await expect(field).toHaveAccessibleDescription("Choose a warehouse."); } };
