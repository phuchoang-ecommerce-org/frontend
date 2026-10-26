import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { Button } from "./button";

const meta = { title: "Shared UI/Button", component: Button, args: { children: "View products", onClick: fn() } } satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = { play: async ({ canvas, args }) => { await userEvent.click(canvas.getByRole("button", { name: "View products" })); await expect(args.onClick).toHaveBeenCalledOnce(); } };
export const Secondary: Story = { args: { variant: "secondary", children: "Back to catalog" } };
export const Quiet: Story = { args: { variant: "quiet", children: "Cancel" } };
export const Loading: Story = { args: { loading: true, children: "Saving address" }, play: async ({ canvas }) => { const button = canvas.getByRole("button", { name: "Saving address" }); await expect(button).toBeDisabled(); await expect(button).toHaveAttribute("aria-busy", "true"); } };
export const Disabled: Story = { args: { disabled: true, children: "Unavailable" } };
