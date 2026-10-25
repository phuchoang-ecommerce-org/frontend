import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card } from "./card";

const meta = { title: "Shared UI/Card", component: Card, args: { title: "Order details", children: <p className="text-base text-ink">Review the shipping address before placing your order.</p> } } satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Titled: Story = {};
export const Plain: Story = { args: { title: undefined, children: <p className="text-base text-ink">Items in your cart are reserved at checkout.</p> } };
