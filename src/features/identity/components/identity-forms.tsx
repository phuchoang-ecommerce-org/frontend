"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button, StatusMessage, TextField } from "@/components/ui";
import type { AddressDraft, FormResult, ProfileDraft } from "../types";

type FieldSpec = {
  name: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  required?: boolean;
};
function ManagedForm<T extends Record<string, string>>({
  initial,
  fields,
  submitLabel,
  onSubmit,
}: {
  initial: T;
  fields: FieldSpec[];
  submitLabel: string;
  onSubmit: (values: T) => Promise<FormResult>;
}) {
  const [values, setValues] = useState<T>(initial);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<FormResult | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  function focusFeedback() {
    window.requestAnimationFrame(() => {
      const target =
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
        formRef.current?.querySelector<HTMLElement>("[data-form-feedback]");
      target?.focus();
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setResult(null);
    try {
      const next = await onSubmit(values);
      setResult(next);
      focusFeedback();
      if (next.ok) {
        const passwordFields = fields.filter(
          (field) => field.type === "password",
        );
        if (passwordFields.length)
          setValues((current) => {
            const updated = { ...current };
            for (const field of passwordFields)
              updated[field.name as keyof T] = "" as T[keyof T];
            return updated;
          });
      }
    } catch {
      setResult({
        ok: false,
        message: "The request could not be completed. Try again.",
      });
      focusFeedback();
    } finally {
      setPending(false);
    }
  }
  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className="space-y-4"
      aria-busy={pending}
    >
      {result && (
        <div
          data-form-feedback
          role={result.ok ? "status" : "alert"}
          tabIndex={-1}
        >
          <StatusMessage
            kind={result.ok ? "success" : "error"}
            message={result.message ?? "Saved."}
          />
        </div>
      )}
      {fields.map((field) => (
        <TextField
          key={field.name}
          name={field.name}
          label={field.label}
          type={field.type}
          autoComplete={field.autoComplete}
          required={field.required}
          value={values[field.name] ?? ""}
          error={!result?.ok ? result?.errors?.[field.name] : undefined}
          disabled={pending}
          onChange={(value) => {
            setValues((current) => ({ ...current, [field.name]: value }));
            if (result && !result.ok)
              setResult({
                ...result,
                errors: { ...result.errors, [field.name]: "" },
              });
          }}
        />
      ))}
      <Button type="submit" loading={pending}>
        {submitLabel}
      </Button>
    </form>
  );
}

export function LoginForm({
  onSubmit,
}: {
  onSubmit: (values: {
    email: string;
    password: string;
  }) => Promise<FormResult>;
}) {
  return (
    <ManagedForm
      initial={{ email: "", password: "" }}
      fields={[
        {
          name: "email",
          label: "Email",
          type: "email",
          autoComplete: "username",
          required: true,
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          autoComplete: "current-password",
          required: true,
        },
      ]}
      submitLabel="Sign in"
      onSubmit={onSubmit}
    />
  );
}
export function RegisterForm({
  onSubmit,
}: {
  onSubmit: (values: {
    name: string;
    email: string;
    password: string;
  }) => Promise<FormResult>;
}) {
  return (
    <ManagedForm
      initial={{ name: "", email: "", password: "" }}
      fields={[
        {
          name: "name",
          label: "Full name",
          autoComplete: "name",
          required: true,
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          autoComplete: "email",
          required: true,
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          autoComplete: "new-password",
          required: true,
        },
      ]}
      submitLabel="Create account"
      onSubmit={onSubmit}
    />
  );
}
export function PasswordForm({
  mode = "reset",
  onSubmit,
}: {
  mode?: "reset" | "change";
  onSubmit: (values: {
    email: string;
    password: string;
    newPassword: string;
  }) => Promise<FormResult>;
}) {
  return (
    <ManagedForm
      initial={{ email: "", password: "", newPassword: "" }}
      fields={
        mode === "reset"
          ? [
              {
                name: "email",
                label: "Email",
                type: "email",
                autoComplete: "email",
                required: true,
              },
            ]
          : [
              {
                name: "password",
                label: "Current password",
                type: "password",
                autoComplete: "current-password",
                required: true,
              },
              {
                name: "newPassword",
                label: "New password",
                type: "password",
                autoComplete: "new-password",
                required: true,
              },
            ]
      }
      submitLabel={mode === "reset" ? "Send reset link" : "Change password"}
      onSubmit={onSubmit}
    />
  );
}
export function ProfileForm({
  profile,
  onSubmit,
}: {
  profile: ProfileDraft;
  onSubmit: (values: ProfileDraft) => Promise<FormResult>;
}) {
  return (
    <ManagedForm
      initial={profile}
      fields={[
        {
          name: "name",
          label: "Full name",
          autoComplete: "name",
          required: true,
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          autoComplete: "email",
          required: true,
        },
        { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
      ]}
      submitLabel="Save profile"
      onSubmit={onSubmit}
    />
  );
}
export function AddressForm({
  address,
  onSubmit,
}: {
  address?: AddressDraft;
  onSubmit: (values: AddressDraft) => Promise<FormResult>;
}) {
  return (
    <ManagedForm
      initial={
        address ?? {
          name: "",
          line1: "",
          line2: "",
          city: "",
          region: "",
          postalCode: "",
          country: "",
          phone: "",
        }
      }
      fields={[
        {
          name: "name",
          label: "Recipient name",
          autoComplete: "name",
          required: true,
        },
        {
          name: "line1",
          label: "Address line 1",
          autoComplete: "address-line1",
          required: true,
        },
        {
          name: "line2",
          label: "Address line 2",
          autoComplete: "address-line2",
        },
        {
          name: "city",
          label: "City",
          autoComplete: "address-level2",
          required: true,
        },
        { name: "region", label: "Region", autoComplete: "address-level1" },
        {
          name: "postalCode",
          label: "Postal code",
          autoComplete: "postal-code",
          required: true,
        },
        {
          name: "country",
          label: "Country",
          autoComplete: "country-name",
          required: true,
        },
        { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
      ]}
      submitLabel="Save address"
      onSubmit={onSubmit}
    />
  );
}
