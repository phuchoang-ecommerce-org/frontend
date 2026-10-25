import type { ReactNode } from "react";

export type PageShellProps = {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function PageShell({ title, children, actions }: PageShellProps) {
  return (
    <main className="mx-auto w-full max-w-content px-3 py-4 font-ui text-ink sm:px-4 sm:py-6 lg:px-6">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <h1 className="min-w-0 text-3xl font-semibold leading-tight text-primary sm:text-4xl">
          {title}
        </h1>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </header>
      {children}
    </main>
  );
}
