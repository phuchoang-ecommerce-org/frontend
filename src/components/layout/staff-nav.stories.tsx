import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StaffNav } from "./staff-nav";

const meta = { title: "Shared Layout/StaffNav", component: StaffNav, args: { links: [{ label: "Orders", href: "/staff/orders" }, { label: "Inventory", href: "/staff/inventory" }, { label: "Refunds", href: "/staff/refunds" }] } } satisfies Meta<typeof StaffNav>;
export default meta;
type Story = StoryObj<typeof meta>;
export const AllowedLinks: Story = {};
