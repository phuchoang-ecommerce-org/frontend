import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";
import { Pagination } from "./pagination";

const meta = { title: "Shared UI/Pagination", component: Pagination, args: { hasNext: true, hasPrevious: false, pageLabel: "Page 1 of 3", onNext: () => {}, onPrevious: () => {} } } satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;
function Example() { const [page, setPage] = useState(1); return <Pagination hasPrevious={page > 1} hasNext={page < 3} pageLabel={`Page ${page} of 3`} onPrevious={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} />; }
export const Interactive: Story = { render: () => <Example />, play: async ({ canvas }) => { await userEvent.click(canvas.getByRole("button", { name: "Next" })); await expect(canvas.getByText("Page 2 of 3")).toBeVisible(); } };
