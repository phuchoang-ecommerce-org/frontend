import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./badge";

const meta = { title: "Shared UI/Badge", component: Badge, args: { label: "Processing", kind: "info" } } satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Info: Story = {};
export const Success: Story = { args: { label: "Delivered", kind: "success" } };
export const Error: Story = { args: { label: "Payment failed", kind: "error" } };
