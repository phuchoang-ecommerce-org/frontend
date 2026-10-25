"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { focusRing } from "./styles";

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> & {
  variant?: "primary" | "secondary" | "quiet";
  loading?: boolean;
  children: ReactNode;
  onClick?: () => void;
};

const variants = {
  primary: "border-primary bg-primary text-surface hover:bg-primary/90",
  secondary:
    "border-control-border bg-surface text-primary hover:border-primary hover:bg-soft",
  quiet: "border-transparent bg-transparent text-primary hover:bg-soft",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className = "",
  type = "button",
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading || undefined}
      className={`inline-flex min-h-control min-w-control items-center justify-center gap-1 rounded-control border px-2 font-ui text-sm font-medium leading-normal transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-60 ${focusRing} ${variants[variant]} ${className}`}
    >
      {loading && <LoaderCircle aria-hidden="true" className="size-2" />}
      {children}
    </button>
  );
}
