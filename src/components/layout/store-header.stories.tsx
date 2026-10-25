import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StoreHeader } from "./store-header";

const meta = { title: "Shared Layout/StoreHeader", component: StoreHeader, args: { cartCount: 2, navLinks: [{ label: "Products", href: "/products" }, { label: "Categories", href: "/categories" }] } } satisfies Meta<typeof StoreHeader>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Guest: Story = {};
export const SignedIn: Story = { args: { accountLabel: "Mai Nguyen", cartCount: 3 } };
