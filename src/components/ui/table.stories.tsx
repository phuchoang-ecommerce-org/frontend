import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Table } from "./table";

const rows = <><thead><tr><th scope="col" className="text-start font-medium">Order</th><th scope="col" className="text-start font-medium">Status</th><th scope="col" className="text-end font-medium">Total</th></tr></thead><tbody><tr><td>#EC-1042</td><td>Preparing</td><td className="text-end">$128.00</td></tr><tr><td>#EC-1041</td><td>Delivered</td><td className="text-end">$72.00</td></tr></tbody></>;
const meta = { title: "Shared UI/Table", component: Table, args: { caption: "Recent orders", children: rows } } satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Orders: Story = {};
