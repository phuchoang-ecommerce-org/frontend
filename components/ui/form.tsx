import * as React from "react";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

// Presentational only (rule I-5) — no lib/api import here. The Problem/FieldError
// shape is mapped to a plain `Record<string, string>` of field errors by the
// calling feature/page, which is the only layer allowed to import lib/api.

function Form({
  className,
  ref,
  ...props
}: React.ComponentProps<"form"> & { ref?: React.Ref<HTMLFormElement> }) {
  return (
    <form ref={ref} data-slot="form" className={cn("flex flex-col gap-4", className)} {...props} />
  );
}

interface FormFieldChildProps {
  id?: string;
  name?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

interface FormFieldProps {
  name: string;
  label: string;
  error?: string | undefined;
  children: React.ReactElement<FormFieldChildProps>;
  className?: string;
}

/** Labeled input + error slot, keyed by `name` — the unit a field-error map is applied to. */
function FormField({ name, label, error, children, className }: FormFieldProps) {
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;

  return (
    <div data-slot="form-field" className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-primary">
        {label}
      </label>
      {React.cloneElement(children, {
        id: inputId,
        name,
        ...(error ? { "aria-invalid": true, "aria-describedby": errorId } : {}),
      })}
      {error ? <FormMessage id={errorId}>{error}</FormMessage> : null}
    </div>
  );
}

/**
 * Icon + border + text, never color alone (ADR-0022 has five colour roles,
 * no sixth — there is no "danger" token to reach for). Used for both a
 * field-level error and a form-level banner (e.g. the non-disclosive
 * sign-in-failure message renders through EmptyState instead, not this).
 */
function FormMessage({ className, id, children, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      id={id}
      role="alert"
      data-slot="form-message"
      className={cn(
        "flex items-center gap-1.5 rounded-control border border-neutral-300 bg-neutral-50 px-2 py-1 text-sm text-neutral-900 transition-colors duration-150",
        className,
      )}
      {...props}
    >
      <AlertCircle aria-hidden="true" className="size-icon shrink-0" />
      {children}
    </p>
  );
}

export { Form, FormField, FormMessage };
