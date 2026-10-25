"use client";

import { useId } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Select } from "radix-ui";
import { fieldBase } from "./styles";

export type SelectFieldProps = {
  name: string;
  label: string;
  value: string;
  options: { value: string; label: string; disabled?: boolean }[];
  required?: boolean;
  hint?: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function SelectField({ name, label, value, options, required, hint, error, disabled, onChange }: SelectFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return <div className="grid gap-1 font-ui">
    <label id={id} className="text-sm font-medium text-ink">{label}{required && <span className="ms-1 text-primary" aria-hidden="true">*</span>}</label>
    <Select.Root name={name} value={value || undefined} onValueChange={onChange} required={required} disabled={disabled}>
      <Select.Trigger aria-labelledby={id} aria-describedby={[hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined} aria-invalid={Boolean(error) || undefined}
        className={`${fieldBase} flex items-center justify-between gap-1 text-start`}>
        <Select.Value placeholder="Select an option" />
        <Select.Icon><ChevronDown size={16} aria-hidden="true" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content position="popper" sideOffset={8} style={{ minWidth: "var(--radix-select-trigger-width)" }} className="z-50 max-h-dvh overflow-y-auto rounded-card border border-border bg-surface p-1 shadow-sm">
          <Select.Viewport>{options.map((option) => <Select.Item key={option.value} value={option.value} disabled={option.disabled}
            className="relative flex min-h-control cursor-default items-center rounded-control pe-4 ps-3 text-sm text-ink outline-hidden data-[disabled]:text-muted data-[highlighted]:bg-soft">
            <Select.ItemText>{option.label}</Select.ItemText><Select.ItemIndicator className="absolute end-2"><Check size={16} aria-hidden="true" /></Select.ItemIndicator>
          </Select.Item>)}</Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
    {hint && <p id={hintId} className="text-sm text-muted">{hint}</p>}
    {error && <p id={errorId} className="text-sm font-medium text-primary">{error}</p>}
  </div>;
}
