import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatusMessage } from "./status-message";

const meta = { title: "Shared UI/StatusMessage", component: StatusMessage, args: { kind: "info", message: "Your order is being prepared." } } satisfies Meta<typeof StatusMessage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Info: Story = {};
export const Success: Story = { args: { kind: "success", message: "Address saved." } };
export const Error: Story = { args: { kind: "error", message: "The address could not be saved. Try again." } };
