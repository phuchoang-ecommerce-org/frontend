import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DevAccountLoginPanel } from "../../src/features/identity/components/dev-account-login-panel";

const meta = {
  title: "Feature Components/Dev Account Login",
  component: DevAccountLoginPanel,
  parameters: { layout: "padded", nextjs: { appDirectory: true } },
} satisfies Meta<typeof DevAccountLoginPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DevAccounts: Story = {
  args: {
    accounts: [
      { key: "customer", email: "customer@demo.local", role: "Customer" },
      { key: "staff", email: "staff@demo.local", role: "Staff" },
    ],
    onSelect: async () => ({ ok: false, message: "Preview only." }),
  },
};
