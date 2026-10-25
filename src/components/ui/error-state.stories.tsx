import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ErrorState } from "./states";

const meta = { title: "Shared UI/ErrorState", component: ErrorState, args: { title: "Orders could not load", message: "Please try again in a moment.", actionLabel: "Retry", onAction: () => {} } } satisfies Meta<typeof ErrorState>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Retry: Story = {};
