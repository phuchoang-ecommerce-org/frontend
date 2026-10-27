"use client";

import { useId } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "./primitives/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./primitives/select";

export type SelectFieldProps = {
  name: string;
  label: string;
  value: string;
  options: { value: string; label: string; disabled?: boolean | undefined }[];
  required?: boolean | undefined;
  hint?: string | undefined;
  error?: string | undefined;
  disabled?: boolean | undefined;
  onChange: (value: string) => void;
};

export function SelectField({ name, label, value, options, required, hint, error, disabled, onChange }: SelectFieldProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return <Field data-invalid={Boolean(error)}>
    <FieldLabel id={labelId} htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</FieldLabel>
    <Select name={name} value={value || undefined} onValueChange={onChange} required={required} disabled={disabled}>
      <SelectTrigger id={id} aria-labelledby={labelId} aria-describedby={[hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined} aria-invalid={Boolean(error) || undefined}>
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => <SelectItem key={option.value} value={option.value} disabled={option.disabled}>{option.label}</SelectItem>)}
      </SelectContent>
    </Select>
    {hint && <FieldDescription id={hintId}>{hint}</FieldDescription>}
    {error && <FieldError id={errorId}>{error}</FieldError>}
  </Field>;
}
