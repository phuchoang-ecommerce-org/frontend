import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Breadcrumbs } from "./breadcrumbs";

const meta = {
  title: "Shared Layout/Breadcrumbs",
  component: Breadcrumbs,
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Orders", href: "/orders" },
      { label: "Order EC-1042", href: "/orders/EC-1042" },
    ],
  },
} satisfies Meta<typeof Breadcrumbs>;
export default meta;
type Story = StoryObj<typeof meta>;
export const OrderDetail: Story = {};
