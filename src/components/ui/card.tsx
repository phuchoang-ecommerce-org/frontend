import type { ReactNode } from "react";

export type CardProps = {
  children: ReactNode;
  title?: string;
  className?: string;
};

export function Card({ children, title, className = "" }: CardProps) {
  return (
    <section
      className={`rounded-card border border-border bg-surface p-3 font-ui text-ink sm:p-4 ${className}`}
    >
      {title && (
        <h2 className="mb-2 text-xl font-semibold leading-tight text-primary">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
