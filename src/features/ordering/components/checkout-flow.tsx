"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button, Card, StatusMessage, TextField } from "@/components/ui";
import { csrfToken } from "@/lib/session/client-csrf";
import { formatMoney } from "@/lib/format/money";
import type { CustomerAddress } from "@/lib/api/addresses";
import type { Checkout } from "@/lib/api/ordering";
import type { PaymentMethod } from "@/lib/api/payment";
import { AddressPicker, ShippingOptionPicker } from "./checkout-controls";
import {
  chooseBillingInformationAction,
  choosePaymentMethodAction,
  chooseShippingAddressAction,
  chooseShippingOptionAction,
  applyVoucherAction,
  removeVoucherAction,
  type CheckoutActionResult,
} from "../server/actions";

type DraftAddress = {
  recipientName: string;
  line1: string;
  city: string;
  postalCode: string;
  countryCode: string;
};
const emptyAddress: DraftAddress = {
  recipientName: "",
  line1: "",
  city: "",
  postalCode: "",
  countryCode: "",
};

function addressOptions(addresses: CustomerAddress[]) {
  return addresses.map((address) => ({
    id: address.id,
    label: address.label || address.recipientName,
    lines: [
      address.line1,
      address.city,
      address.postalCode,
      address.countryCode,
    ].filter(Boolean),
  }));
}

export function CheckoutFlow({
  checkout,
  addresses,
  paymentMethods,
}: {
  checkout: Checkout;
  addresses: CustomerAddress[];
  paymentMethods: PaymentMethod[];
}) {
  const [notice, setNotice] = useState<CheckoutActionResult | null>(null);
  const [shippingDraft, setShippingDraft] =
    useState<DraftAddress>(emptyAddress);
  const [billingDraft, setBillingDraft] = useState<DraftAddress>(emptyAddress);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(
    Boolean(checkout.order.billingAddress && checkout.order.shippingAddress),
  );
  const [voucherCode, setVoucherCode] = useState("");
  const [pending, startTransition] = useTransition();
  const shippingOptions =
    checkout.shippingOptions?.map((option) => ({
      id: option.id,
      label: [option.carrier, option.serviceName].filter(Boolean).join(" — "),
      fee: formatMoney(option.fee),
      ...(option.estimatedDeliveryFrom && option.estimatedDeliveryTo
        ? {
            estimate: `${new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(option.estimatedDeliveryFrom))}–${new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(option.estimatedDeliveryTo))}`,
          }
        : {}),
      available: true,
    })) ?? [];
  const options = addressOptions(addresses);
  const run = (action: (token: string) => Promise<CheckoutActionResult>) =>
    startTransition(() => {
      void csrfToken()
        .then(action)
        .then(setNotice)
        .catch(() =>
          setNotice({
            ok: false,
            message: "Checkout could not be updated. Try again.",
          }),
        );
    });
  const addressFields = (
    value: DraftAddress,
    setValue: (next: DraftAddress) => void,
    prefix: string,
  ) => {
    const errors = notice?.ok === false ? notice.errors : undefined;
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          name={`${prefix}-recipient`}
          label="Recipient"
          value={value.recipientName}
          required
          error={errors?.recipientName}
          onChange={(recipientName) => setValue({ ...value, recipientName })}
        />
        <TextField
          name={`${prefix}-line1`}
          label="Street address"
          value={value.line1}
          required
          error={errors?.line1}
          autoComplete="street-address"
          onChange={(line1) => setValue({ ...value, line1 })}
        />
        <TextField
          name={`${prefix}-city`}
          label="City"
          value={value.city}
          required
          error={errors?.city}
          autoComplete="address-level2"
          onChange={(city) => setValue({ ...value, city })}
        />
        <TextField
          name={`${prefix}-postal`}
          label="Postal code"
          value={value.postalCode}
          required
          error={errors?.postalCode}
          autoComplete="postal-code"
          onChange={(postalCode) => setValue({ ...value, postalCode })}
        />
        <TextField
          name={`${prefix}-country`}
          label="Country code"
          value={value.countryCode}
          required
          error={errors?.countryCode}
          hint="Two letters, e.g. VN"
          autoComplete="country"
          onChange={(countryCode) => setValue({ ...value, countryCode })}
        />
      </div>
    );
  };
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="space-y-5">
        {notice && (
          <StatusMessage
            kind={notice.ok ? "success" : "error"}
            message={
              notice.ok
                ? (notice.message ?? "Checkout updated.")
                : notice.message
            }
          />
        )}
        <Card title="1. Delivery address">
          <div className="space-y-4">
            <AddressPicker
              addresses={options}
              onSelect={(addressId) =>
                run((token) =>
                  chooseShippingAddressAction(
                    {
                      checkoutId: checkout.order.id,
                      addressId,
                      saveToAddressBook: true,
                    },
                    token,
                  ),
                )
              }
              onAdd={() => {
                document
                  .getElementById("new-shipping-address")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            />
            <form
              id="new-shipping-address"
              className="space-y-3 border-t border-border pt-4"
              onSubmit={(event) => {
                event.preventDefault();
                run((token) =>
                  chooseShippingAddressAction(
                    {
                      checkoutId: checkout.order.id,
                      address: shippingDraft,
                      saveToAddressBook: true,
                    },
                    token,
                  ),
                );
              }}
            >
              <h3 className="font-semibold">Use a new address</h3>
              {addressFields(shippingDraft, setShippingDraft, "shipping")}
              <Button type="submit" loading={pending}>
                Save delivery address
              </Button>
            </form>
          </div>
        </Card>
        <Card title="2. Billing information">
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={billingSameAsShipping}
                onChange={(event) =>
                  setBillingSameAsShipping(event.target.checked)
                }
                className="accent-primary"
              />{" "}
              Same as delivery address
            </label>
            {!billingSameAsShipping && (
              <>
                <AddressPicker
                  addresses={options}
                  onSelect={(addressId) =>
                    run((token) =>
                      chooseBillingInformationAction(
                        {
                          checkoutId: checkout.order.id,
                          addressId,
                          sameAsShipping: false,
                        },
                        token,
                      ),
                    )
                  }
                  onAdd={() => {
                    document
                      .getElementById("new-billing-address")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                />
                <form
                  id="new-billing-address"
                  className="space-y-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    run((token) =>
                      chooseBillingInformationAction(
                        {
                          checkoutId: checkout.order.id,
                          address: billingDraft,
                          sameAsShipping: false,
                        },
                        token,
                      ),
                    );
                  }}
                >
                  {addressFields(billingDraft, setBillingDraft, "billing")}
                  <Button type="submit" loading={pending}>
                    Save billing address
                  </Button>
                </form>
              </>
            )}
            <Button
              variant="secondary"
              loading={pending}
              onClick={() =>
                run((token) =>
                  chooseBillingInformationAction(
                    {
                      checkoutId: checkout.order.id,
                      sameAsShipping: billingSameAsShipping,
                    },
                    token,
                  ),
                )
              }
            >
              Save billing information
            </Button>
          </div>
        </Card>
        <Card title="3. Shipping method">
          <ShippingOptionPicker
            options={shippingOptions}
            {...(checkout.selectedShippingOptionId
              ? { selectedId: checkout.selectedShippingOptionId }
              : {})}
            onSelect={(shippingOptionId) =>
              run((token) =>
                chooseShippingOptionAction(
                  checkout.order.id,
                  shippingOptionId,
                  token,
                ),
              )
            }
          />
        </Card>
        <Card title="4. Payment method">
          <fieldset className="space-y-2">
            <legend className="sr-only">Payment method</legend>
            {paymentMethods.map((method) => (
              <label
                key={method.type}
                className="flex cursor-pointer items-start justify-between gap-3 rounded-card border border-border p-3 has-checked:border-primary"
              >
                <span className="flex gap-3">
                  <input
                    type="radio"
                    name="payment-method"
                    checked={checkout.paymentMethod?.type === method.type}
                    disabled={!method.eligible || pending}
                    onChange={() =>
                      run((token) =>
                        choosePaymentMethodAction(
                          checkout.order.id,
                          method.type,
                          token,
                        ),
                      )
                    }
                    className="mt-1 accent-primary"
                  />
                  <span>
                    <strong>{method.displayName || method.type}</strong>
                    {!method.eligible && (
                      <span className="block text-sm text-muted-foreground">
                        {method.ineligibleReason ||
                          "Unavailable for this order."}
                      </span>
                    )}
                  </span>
                </span>
                {method.eligible && (
                  <span className="text-sm text-muted-foreground">
                    Available
                  </span>
                )}
              </label>
            ))}
            {!paymentMethods.length && (
              <p className="text-sm text-muted-foreground">
                Payment methods will be available after delivery details are
                complete.
              </p>
            )}
          </fieldset>
        </Card>
        <Card title="Voucher">
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              run((token) =>
                applyVoucherAction(checkout.order.id, voucherCode, token),
              );
            }}
          >
            <TextField
              name="voucher"
              label="Voucher code"
              value={voucherCode}
              error={notice?.ok === false ? notice.errors?.code : undefined}
              onChange={setVoucherCode}
            />
            <div className="flex shrink-0 items-end gap-2">
              <Button type="submit" loading={pending}>
                Apply
              </Button>
              {checkout.order.promotionCode && (
                <Button
                  variant="secondary"
                  loading={pending}
                  onClick={() =>
                    run((token) =>
                      removeVoucherAction(checkout.order.id, token),
                    )
                  }
                >
                  Remove {checkout.order.promotionCode}
                </Button>
              )}
            </div>
          </form>
          {checkout.order.promotionCode && (
            <p className="mt-3 text-sm text-muted-foreground">
              Applied: {checkout.order.promotionCode}. The total shown is the
              server-calculated preview.
            </p>
          )}
        </Card>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-4">
        <Card title="Draft order">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt>Items</dt>
              <dd>{checkout.order.lines.length}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">
                {formatMoney(checkout.order.subtotal)}
              </dd>
            </div>
            {checkout.order.shippingFee && (
              <div className="flex justify-between gap-3">
                <dt>Shipping</dt>
                <dd className="tabular-nums">
                  {formatMoney(checkout.order.shippingFee)}
                </dd>
              </div>
            )}
            {checkout.order.discount && (
              <div className="flex justify-between gap-3">
                <dt>Discount</dt>
                <dd className="tabular-nums">
                  −{formatMoney(checkout.order.discount)}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-3 border-t border-border pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">
                {formatMoney(checkout.order.total)}
              </dd>
            </div>
          </dl>
          {checkout.ready ? (
            <Link
              href="/checkout/review"
              className="mt-4 inline-flex min-h-control items-center rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Review order
            </Link>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Complete the remaining checkout details to review your order.
            </p>
          )}
        </Card>
      </aside>
    </div>
  );
}
