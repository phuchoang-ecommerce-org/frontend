"use client";

import { useId } from "react";
import { Input } from "./primitives/input";
import { Field, FieldDescription, FieldError, FieldLabel } from "./primitives/field";

export type TextFieldProps = {
  name: string;
  label: string;
  type?: React.HTMLInputTypeAttribute | undefined;
  value: string;
  required?: boolean | undefined;
  hint?: string | undefined;
  error?: string | undefined;
  autoComplete?: string | undefined;
  disabled?: boolean | undefined;
  onChange: (value: string) => void;
  onBlur?: (() => void) | undefined;
};

export function TextField({
  name,
  label,
  type = "text",
  value,
  required,
  hint,
  error,
  autoComplete,
  disabled,
  onChange,
  onBlur,
}: TextFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const description =
    [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden="true">
            *
          </span>
        )}
      </FieldLabel>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-required={required || undefined}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={description}
      />
      {hint && (
        <FieldDescription id={hintId}>
          {hint}
        </FieldDescription>
      )}
      {error && (
        <FieldError id={errorId}>
          {error}
        </FieldError>
      )}
    </Field>
  );
}
