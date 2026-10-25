import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { AccountMenu, Breadcrumbs, PageShell, StaffNav, StoreHeader } from "./layout";
import { AlertDialog, Badge, Button, Card, Dialog, EmptyState, ErrorState, LoadingSkeleton, Pagination, SelectField, StatusMessage, Table, TextField } from "./ui";

const meta = {
  title: "Shared Components/Overview",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function ComponentGallery() {
  const [email, setEmail] = useState("");
  const [warehouse, setWarehouse] = useState("north");
  const [street, setStreet] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [statusVisible, setStatusVisible] = useState(true);
  const [page, setPage] = useState(1);

  return <div className="min-h-dvh bg-background font-ui text-ink">
    <StoreHeader cartCount={2} accountLabel="Mai Nguyen" navLinks={[{ label: "Products", href: "/products" }, { label: "Categories", href: "/categories" }]} />
    <PageShell title="Shared components" actions={<AccountMenu displayName="Mai Nguyen" links={[{ label: "Profile", href: "/account" }, { label: "Orders", href: "/account/orders" }]} onSignOut={() => {}} />}>
      <div className="space-y-8">
        <div className="grid gap-2">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Components", href: "/components" }]} />
          <p className="max-w-3xl text-base leading-relaxed text-muted">A calm foundation for storefront and staff tasks. Each control uses the same spacing, typography, and focus treatment.</p>
        </div>

        <div className="grid gap-3 lg:grid-cols-12">
          <Card title="Actions" className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              <Button>Place order</Button>
              <Button variant="secondary">Save for later</Button>
              <Button variant="quiet">Cancel</Button>
              <Button loading>Saving address</Button>
              <Button disabled>Unavailable</Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              <Badge label="Processing" kind="info" />
              <Badge label="Delivered" kind="success" />
              <Badge label="Payment failed" kind="error" />
            </div>
          </Card>

          <Card title="Feedback" className="lg:col-span-5">
            <div className="grid gap-2">
              {statusVisible && <StatusMessage kind="success" message="Address saved." onDismiss={() => setStatusVisible(false)} />}
              <StatusMessage kind="error" message="Payment could not be completed. Try another method." />
            </div>
          </Card>
        </div>

        <Card title="Form controls">
          <div className="grid gap-3 md:grid-cols-2">
            <TextField name="email" label="Email address" type="email" value={email} required hint="We will send order updates here." autoComplete="email" onChange={setEmail} />
            <SelectField name="warehouse" label="Warehouse" value={warehouse} options={[{ value: "north", label: "North warehouse" }, { value: "south", label: "South warehouse" }, { value: "central", label: "Central warehouse", disabled: true }]} onChange={setWarehouse} />
            <TextField name="contact" label="Contact number" value="123" error="Enter a valid phone number." onChange={() => {}} />
          </div>
        </Card>

        <div className="grid gap-3 lg:grid-cols-2">
          <EmptyState title="Your cart is empty" message="View products to add an item." actionLabel="View products" actionHref="/products" />
          <ErrorState title="Orders could not load" message="Please try again in a moment." actionLabel="Retry" onAction={() => {}} />
        </div>

        <Card title="Orders and loading">
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="grid gap-3 lg:col-span-8">
              <Table caption="Recent orders"><thead><tr><th scope="col" className="text-start font-medium">Order</th><th scope="col" className="text-start font-medium">Status</th><th scope="col" className="text-end font-medium">Total</th></tr></thead><tbody><tr><td>#EC-1042</td><td>Preparing</td><td className="text-end">$128.00</td></tr><tr><td>#EC-1041</td><td>Delivered</td><td className="text-end">$72.00</td></tr></tbody></Table>
              <Pagination hasPrevious={page > 1} hasNext={page < 3} pageLabel={`Page ${page} of 3`} onPrevious={() => setPage((value) => value - 1)} onNext={() => setPage((value) => value + 1)} />
            </div>
            <div className="grid content-start gap-2 lg:col-span-4">
              <p className="text-sm font-medium text-muted">Loading rows</p>
              <LoadingSkeleton shape="row" count={3} />
            </div>
          </div>
        </Card>

        <Card title="Staff navigation and decisions">
          <div className="grid gap-3">
            <StaffNav links={[{ label: "Orders", href: "/staff/orders" }, { label: "Inventory", href: "/staff/inventory" }, { label: "Refunds", href: "/staff/refunds" }]} />
            <div className="flex flex-wrap gap-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title="Add address" description="Save an address for future orders." trigger={<Button variant="secondary">Add address</Button>}>
                <div className="grid gap-3"><TextField name="street" label="Street address" value={street} onChange={setStreet} /><Button onClick={() => setDialogOpen(false)}>Save address</Button></div>
              </Dialog>
              <Button variant="quiet" onClick={() => setConfirmOpen(true)}>Remove address</Button>
              <AlertDialog open={confirmOpen} title="Remove address?" message="This address will be removed from your account." confirmLabel="Remove address" onConfirm={() => setConfirmOpen(false)} onCancel={() => setConfirmOpen(false)} />
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  </div>;
}

export const Gallery: Story = {
  render: () => <ComponentGallery />,
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Place order" });
    await expect(button).toBeVisible();
    await expect(getComputedStyle(button).backgroundColor).toBe("rgb(30, 58, 95)");
    await expect(getComputedStyle(button).minHeight).toBe("44px");
  },
};
