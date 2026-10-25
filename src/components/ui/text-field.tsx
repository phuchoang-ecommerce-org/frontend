"use client";

import { useId } from "react";
import { Label } from "radix-ui";
import { fieldBase } from "./styles";

export type TextFieldProps = {
  name: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  value: string;
  required?: boolean;
  hint?: string;
  error?: string;
  autoComplete?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
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
    <div className="grid gap-1 font-ui">
      <Label.Root htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && (
          <span className="ms-1 text-primary" aria-hidden="true">
            *
          </span>
        )}
      </Label.Root>
      <input
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
        className={fieldBase}
      />
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-primary">
          {error}
        </p>
      )}
    </div>
  );
}
