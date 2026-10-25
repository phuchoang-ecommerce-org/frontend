import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LoadingSkeleton } from "./loading-skeleton";

const meta = { title: "Shared UI/LoadingSkeleton", component: LoadingSkeleton, args: { shape: "row", count: 3 } } satisfies Meta<typeof LoadingSkeleton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Rows: Story = {};
export const Card: Story = { args: { shape: "card", count: 1 } };
export const Text: Story = { args: { shape: "text", count: 4 } };
