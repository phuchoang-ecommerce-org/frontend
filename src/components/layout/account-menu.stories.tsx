import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, userEvent } from "storybook/test";
import { AccountMenu } from "./account-menu";

const meta = { title: "Shared Layout/AccountMenu", component: AccountMenu, args: { displayName: "Mai Nguyen", links: [{ label: "Profile", href: "/account" }, { label: "Orders", href: "/account/orders" }], onSignOut: () => {} } } satisfies Meta<typeof AccountMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvas }) => { await userEvent.click(canvas.getByRole("button", { name: "Mai Nguyen" })); await expect(await screen.findByRole("menuitem", { name: "Orders" })).toBeVisible(); await userEvent.keyboard("{Escape}"); await expect(screen.queryByRole("menuitem", { name: "Orders" })).not.toBeInTheDocument(); } };
