import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

const rows = <><TableHeader><TableRow><TableHead scope="col">Order</TableHead><TableHead scope="col">Status</TableHead><TableHead scope="col">Total</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>#EC-1042</TableCell><TableCell>Preparing</TableCell><TableCell>$128.00</TableCell></TableRow><TableRow><TableCell>#EC-1041</TableCell><TableCell>Delivered</TableCell><TableCell>$72.00</TableCell></TableRow></TableBody></>;
const meta = { title: "Shared UI/Table", component: Table, args: { caption: "Recent orders", children: rows } } satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Orders: Story = {};
