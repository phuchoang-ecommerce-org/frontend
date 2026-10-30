"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  Button,
  Dialog,
  StatusMessage,
  TextField,
} from "@/components/ui";
import { csrfToken } from "@/lib/session/client-csrf";
import type { AddressData, AddressDraft, FormResult } from "../types";

const emptyAddress: AddressDraft = {
  label: "",
  recipientName: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postalCode: "",
  countryCode: "",
  phone: "",
  isDefaultShipping: false,
  isDefaultBilling: false,
};

function draft(address: AddressData): AddressDraft {
  const { id: _id, ...value } = address;
  void _id;
  return value;
}

function AddressEditor({
  address,
  isFirst,
  pending,
  onSave,
}: {
  address: AddressData | null;
  isFirst: boolean;
  pending: boolean;
  onSave: (values: AddressDraft) => Promise<FormResult>;
}) {
  const [values, setValues] = useState<AddressDraft>(() =>
    address ? draft(address) : { ...emptyAddress, isDefaultShipping: isFirst },
  );
  const [result, setResult] = useState<FormResult | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function update(name: keyof AddressDraft, value: string | boolean) {
    setValues((current) => ({ ...current, [name]: value }));
    if (result && !result.ok) setResult(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = await onSave(values);
    setResult(next);
    if (!next.ok) {
      requestAnimationFrame(() => {
        const target =
          formRef.current?.querySelector<HTMLElement>(
            '[aria-invalid="true"]',
          ) ??
          formRef.current?.querySelector<HTMLElement>(
            "[data-address-feedback]",
          );
        target?.focus();
      });
    }
  }

  const fields: Array<{
    name: Exclude<keyof AddressDraft, "isDefaultShipping" | "isDefaultBilling">;
    label: string;
    required?: boolean;
    autoComplete?: string;
    type?: React.HTMLInputTypeAttribute;
    hint?: string;
  }> = [
    {
      name: "label",
      label: "Address label",
      hint: "For example, Home or Office.",
    },
    {
      name: "recipientName",
      label: "Recipient name",
      required: true,
      autoComplete: "name",
    },
    {
      name: "line1",
      label: "Address line 1",
      required: true,
      autoComplete: "address-line1",
    },
    { name: "line2", label: "Address line 2", autoComplete: "address-line2" },
    {
      name: "city",
      label: "City",
      required: true,
      autoComplete: "address-level2",
    },
    {
      name: "region",
      label: "State or region",
      autoComplete: "address-level1",
    },
    {
      name: "postalCode",
      label: "Postal code",
      required: true,
      autoComplete: "postal-code",
    },
    {
      name: "countryCode",
      label: "Country code",
      required: true,
      autoComplete: "country",
      hint: "Use the two-letter code, such as VN or US.",
    },
    { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  ];

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className="space-y-4"
      aria-busy={pending}
    >
      {result && !result.ok && (
        <div data-address-feedback tabIndex={-1}>
          <StatusMessage kind="error" message={result.message} />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.name}
            className={
              field.name === "line1" || field.name === "line2"
                ? "sm:col-span-2"
                : undefined
            }
          >
            <TextField
              name={field.name}
              label={field.label}
              type={field.type}
              value={values[field.name]}
              required={field.required}
              autoComplete={field.autoComplete}
              hint={field.hint}
              error={!result?.ok ? result?.errors?.[field.name] : undefined}
              disabled={pending}
              onChange={(value) => update(field.name, value)}
            />
          </div>
        ))}
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Defaults</legend>
        {[
          ["isDefaultShipping", "Use as my default shipping address"],
          ["isDefaultBilling", "Use as my default billing address"],
        ].map(([name, label]) => (
          <label
            key={name}
            className="flex min-h-control items-center gap-3 text-sm"
          >
            <input
              type="checkbox"
              checked={values[name as "isDefaultShipping" | "isDefaultBilling"]}
              disabled={pending}
              onChange={(event) =>
                update(
                  name as "isDefaultShipping" | "isDefaultBilling",
                  event.target.checked,
                )
              }
              className="size-5 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            {label}
          </label>
        ))}
      </fieldset>
      <Button type="submit" loading={pending}>
        Save address
      </Button>
    </form>
  );
}

export function AddressBook({
  addresses,
  onSave,
  onRemove,
}: {
  addresses: AddressData[];
  onSave: (
    addressId: string | null,
    values: AddressDraft,
    csrfToken: string,
  ) => Promise<FormResult>;
  onRemove: (addressId: string, csrfToken: string) => Promise<FormResult>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<AddressData | "new" | null>(null);
  const [removing, setRemoving] = useState<AddressData | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<FormResult | null>(null);

  async function save(addressId: string | null, values: AddressDraft) {
    setPending(true);
    try {
      const result = await onSave(addressId, values, await csrfToken());
      if (result.ok) {
        setEditing(null);
        setMessage(result);
        router.refresh();
      }
      return result;
    } catch {
      return {
        ok: false as const,
        message: "The address could not be saved. Try again.",
      };
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!removing) return;
    setPending(true);
    try {
      const result = await onRemove(removing.id, await csrfToken());
      setMessage(result);
      if (result.ok) {
        setRemoving(null);
        router.refresh();
      }
    } catch {
      setMessage({
        ok: false,
        message: "The address could not be removed. Try again.",
      });
    } finally {
      setPending(false);
    }
  }

  async function makeDefault(address: AddressData) {
    setPending(true);
    try {
      const result = await onSave(
        address.id,
        { ...draft(address), isDefaultShipping: true },
        await csrfToken(),
      );
      setMessage(result);
      if (result.ok) router.refresh();
    } catch {
      setMessage({
        ok: false,
        message: "The default address could not be updated. Try again.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Saved addresses make checkout faster. Orders already placed keep their
          original delivery details.
        </p>
        <Button onClick={() => setEditing("new")}>Add address</Button>
      </div>
      {message && (
        <StatusMessage
          kind={message.ok ? "success" : "error"}
          message={message.message ?? "Saved."}
          onDismiss={() => setMessage(null)}
        />
      )}
      {addresses.length === 0 ? (
        <div className="rounded-card border border-dashed border-border p-6">
          <h2 className="font-semibold">No saved addresses</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add one now so it is ready when you check out.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <li
              key={address.id}
              className="rounded-card border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">
                    {address.label || address.recipientName}
                  </h2>
                  {address.isDefaultShipping && (
                    <p className="mt-1 text-sm font-medium text-primary">
                      Default shipping
                    </p>
                  )}
                </div>
              </div>
              <address className="mt-3 text-sm not-italic leading-6 text-muted-foreground">
                <span className="block text-foreground">
                  {address.recipientName}
                </span>
                <span className="block">{address.line1}</span>
                {address.line2 && (
                  <span className="block">{address.line2}</span>
                )}
                <span className="block">
                  {[address.city, address.region, address.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </span>
                <span className="block">{address.countryCode}</span>
                {address.phone && (
                  <span className="block">{address.phone}</span>
                )}
              </address>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                <Button
                  variant="secondary"
                  disabled={pending}
                  onClick={() => setEditing(address)}
                >
                  Edit
                </Button>
                {!address.isDefaultShipping && (
                  <Button
                    variant="quiet"
                    disabled={pending}
                    onClick={() => void makeDefault(address)}
                  >
                    Make default
                  </Button>
                )}
                <Button
                  variant="quiet"
                  disabled={pending}
                  onClick={() => setRemoving(address)}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Dialog
        open={editing !== null}
        title={
          editing === "new" ? "Add shipping address" : "Edit shipping address"
        }
        description="Required fields are marked with an asterisk."
        contentClassName="max-h-screen overflow-y-auto sm:max-w-2xl"
        onOpenChange={(open) => {
          if (!open && !pending) setEditing(null);
        }}
      >
        <AddressEditor
          key={editing === "new" ? "new" : editing?.id}
          address={editing === "new" ? null : editing}
          isFirst={addresses.length === 0}
          pending={pending}
          onSave={(values) =>
            save(editing === "new" ? null : (editing?.id ?? null), values)
          }
        />
      </Dialog>
      <AlertDialog
        open={removing !== null}
        title="Remove this address?"
        message="Past orders will keep their recorded delivery address."
        confirmLabel="Remove address"
        pending={pending}
        onConfirm={remove}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}
