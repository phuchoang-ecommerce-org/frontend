import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { CartLine, CartSummary, WishlistItem } from "./cart/components";
import {
  CategoryTree,
  ProductEditor,
  ProductGrid,
  VariantPicker,
} from "./catalog/components";
import {
  AddressBook,
  LoginForm,
  PasswordForm,
  ProfileForm,
  RegisterForm,
} from "./identity/components";
import { StockAdjustmentForm, StockTable } from "./inventory/components";
import {
  AddressPicker,
  CheckoutSteps,
  OrderCard,
  OrderSummary,
  PlaceOrderButton,
  ReturnRequestForm,
  ShippingOptionPicker,
} from "./ordering/components";
import {
  PaymentMethodPicker,
  PaymentProcessingStatus,
  PaymentStatePanel,
  RefundForm,
  RetryPaymentButton,
} from "./payment/components";
import { ShipmentForm, TrackingTimeline } from "./shipping/components";

const meta = {
  title: "Feature Components/Areas",
  parameters: { layout: "padded", nextjs: { appDirectory: true } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
const saved = async () => ({ ok: true as const, message: "Saved." });

export const Identity: Story = {
  render: () => (
    <div className="grid gap-8 md:grid-cols-2">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Sign in</h2>
        <LoginForm onSubmit={saved} />
      </section>
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Account forms</h2>
        <RegisterForm onSubmit={saved} />
        <PasswordForm onSubmit={saved} />
        <ProfileForm
          profile={{ name: "Mai Nguyen", email: "mai@example.com", phone: "" }}
          onSubmit={saved}
        />
        <AddressBook
          addresses={[]}
          onSave={saved}
          onRemove={saved}
        />
      </section>
    </div>
  ),
};

export const Catalog: Story = {
  render: () => (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <CategoryTree
        categories={[
          {
            id: "clothing",
            label: "Clothing",
            href: "/categories/clothing",
            children: [
              { id: "shirts", label: "Shirts", href: "/categories/shirts" },
            ],
          },
        ]}
      />
      <div className="space-y-6">
        <ProductGrid
          products={[
            {
              id: "shirt",
              name: "Cotton shirt",
              href: "/products/shirt",
              price: "$24.00",
              availability: "available",
            },
            {
              id: "coat",
              name: "Winter coat",
              href: "/products/coat",
              price: "$89.00",
              availability: "unavailable",
            },
          ]}
        />
        <VariantStory />
        <ProductEditor onSubmit={() => {}} />
      </div>
    </div>
  ),
};
function VariantStory() {
  const [value, setValue] = useState("small");
  return (
    <VariantPicker
      variants={[
        { id: "small", label: "Small", available: true },
        { id: "large", label: "Large", available: false },
      ]}
      value={value}
      onChange={setValue}
    />
  );
}

export const Cart: Story = {
  render: () => (
    <div className="grid gap-6 md:grid-cols-[1fr_300px]">
      <div>
        <CartLine
          line={{
            id: "1",
            productName: "Cotton shirt",
            href: "/products/shirt",
            quantity: 2,
            unitPrice: "$24.00",
            lineTotal: "$48.00",
            available: true,
            priceChanged: false,
            stockShort: false,
          }}
          onQuantityChange={async () => ({
            ok: false,
            error: "Only 2 remain in stock.",
          })}
          onRemove={() => {}}
        />
        <WishlistItem
          item={{
            id: "2",
            name: "Winter coat",
            href: "/products/coat",
            price: "$89.00",
            available: false,
          }}
          onMoveToCart={() => {}}
          onRemove={() => {}}
        />
      </div>
      <CartSummary
        summary={{ subtotal: "$48.00", total: "$48.00", canCheckout: true }}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const quantity = canvas.getByRole("spinbutton", { name: "Quantity" });
    await userEvent.clear(quantity);
    await userEvent.type(quantity, "3");
    await userEvent.click(canvas.getByRole("button", { name: "Update" }));
    await expect(canvas.getByText("Only 2 remain in stock.")).toBeVisible();
    await expect(quantity).toHaveValue(2);
  },
};

export const CheckoutAndOrders: Story = {
  render: () => (
    <div className="space-y-8">
      <CheckoutStory />
      <div className="grid gap-4 md:grid-cols-2">
        <OrderSummary
          summary={{
            lines: [
              {
                id: "shirt",
                name: "Cotton shirt",
                quantity: 2,
                total: "$48.00",
              },
            ],
            subtotal: "$48.00",
            shipping: "$5.00",
            total: "$53.00",
          }}
        >
          <PlaceOrderButton canPlace onPlaceOrder={() => {}} />
        </OrderSummary>
        <div className="space-y-4">
          <OrderCard
            order={{
              id: "EC-1042",
              href: "/account/orders/EC-1042",
              placedAt: "26 Oct 2026",
              status: "Preparing",
              total: "$53.00",
              itemCount: 2,
            }}
          />
          <ReturnRequestForm
            orderLines={[
              {
                id: "shirt",
                name: "Cotton shirt",
                quantity: 2,
                total: "$48.00",
                returnable: true,
              },
            ]}
            onSubmit={() => {}}
          />
        </div>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("group", { name: "Shipping address" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await expect(
      canvas.getByRole("group", { name: "Shipping option" }),
    ).toBeVisible();
  },
};
function CheckoutStory() {
  const [address, setAddress] = useState("home");
  const [shipping, setShipping] = useState("standard");
  const [method, setMethod] = useState("card");
  return (
    <CheckoutSteps
      steps={["Address", "Shipping", "Payment"]}
      panels={[
        <AddressPicker
          key="address"
          addresses={[
            { id: "home", label: "Home", lines: ["12 Market Street", "Hanoi"] },
          ]}
          selectedId={address}
          onSelect={setAddress}
          onAdd={() => {}}
        />,
        <ShippingOptionPicker
          key="shipping"
          options={[
            {
              id: "standard",
              label: "Standard",
              fee: "$5.00",
              estimate: "3–5 days",
              available: true,
            },
          ]}
          selectedId={shipping}
          onSelect={setShipping}
        />,
        <PaymentMethodPicker
          key="payment"
          methods={[
            { type: "card", label: "Card", available: true },
            { type: "cod", label: "Cash on delivery", available: true },
          ]}
          selectedType={method}
          onSelect={setMethod}
        />,
      ]}
    />
  );
}

export const Payment: Story = {
  render: () => (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <PaymentStatePanel state="pending" lastCheckedAt="26 Oct 2026, 10:30">
          <RetryPaymentButton canRetry={false} onRetry={() => {}} />
        </PaymentStatePanel>
        <PaymentProcessingStatus
          state="paid"
          orderHref="/account/orders/EC-1042"
        />
      </div>
      <RefundForm maxRefundableAmount="$53.00" onSubmit={() => {}} />
    </div>
  ),
};

export const Shipping: Story = {
  render: () => (
    <div className="grid gap-6 md:grid-cols-2">
      <TrackingTimeline
        shipments={[
          {
            id: "SHP-1",
            carrier: "Postal service",
            trackingNumber: "TRK123",
            status: "In transit",
            events: [
              {
                id: "1",
                label: "Collected",
                occurredAt: "2026-10-25T09:00:00Z",
              },
              {
                id: "2",
                label: "In transit",
                occurredAt: "2026-10-26T08:00:00Z",
              },
            ],
          },
        ]}
      />
      <ShipmentForm
        orderId="EC-1042"
        carriers={[
          { value: "postal", label: "Postal service" },
          { value: "manual", label: "Manual" },
        ]}
        onSubmit={() => {}}
      />
    </div>
  ),
};

export const Inventory: Story = {
  render: () => (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <StockTable
        items={[
          {
            id: "1",
            sku: "SHIRT-BLK-M",
            warehouse: "North",
            onHand: 21,
            available: 18,
            reserved: 3,
          },
        ]}
      />
      <StockAdjustmentForm
        stockItemId="1"
        sku="SHIRT-BLK-M"
        warehouseId="north"
        reasonCodes={[
          { value: "count", label: "Cycle count" },
          { value: "damage", label: "Damage" },
        ]}
        onSubmit={() => {}}
      />
    </div>
  ),
};
