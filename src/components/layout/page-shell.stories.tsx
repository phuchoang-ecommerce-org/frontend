import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PageShell } from "./page-shell";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

const meta = { title: "Shared Layout/PageShell", component: PageShell, args: { title: "Orders", actions: <Button>View cart</Button>, children: <Card title="Recent orders"><p>Your latest orders appear here.</p></Card> } } satisfies Meta<typeof PageShell>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
