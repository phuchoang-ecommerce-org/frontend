import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-control-sm w-full rounded-control border border-border bg-surface px-3 text-sm text-neutral-900",
        "placeholder:text-neutral-500",
        "transition-colors outline-none",
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
