"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { Button as PrimitiveButton } from "./primitives/button";

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "className"
> & {
  variant?: "primary" | "secondary" | "quiet";
  loading?: boolean;
  children: ReactNode;
  onClick?: () => void;
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  type = "button",
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <PrimitiveButton
      {...rest}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading || undefined}
      variant={
        variant === "primary"
          ? "default"
          : variant === "secondary"
            ? "outline"
            : "ghost"
      }
    >
      {loading && <LoaderCircle aria-hidden="true" size={16} />}
      {children}
    </PrimitiveButton>
  );
}
