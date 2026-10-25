import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyState, ErrorState } from "./states";

const meta = { title: "Shared UI/EmptyState", component: EmptyState, args: { title: "Your cart is empty", message: "View products to add an item.", actionLabel: "View products", actionHref: "/products" } } satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = {};
export const Error: Story = { render: () => <ErrorState title="Orders could not load" message="Please try again in a moment." actionLabel="Retry" onAction={() => {}} /> };
