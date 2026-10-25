import type { ReactNode } from "react";

export type TableProps = { children: ReactNode; caption: string };

export function Table({ children, caption }: TableProps) {
  return <div className="w-full overflow-x-auto rounded-card border border-border bg-surface font-ui">
    <table className="w-full min-w-max border-collapse text-start text-sm text-ink [&_td]:h-6 [&_td]:px-2 [&_td]:py-1 [&_th]:h-6 [&_th]:px-2 [&_th]:py-1 [&_thead]:border-b [&_thead]:border-border [&_tbody_tr]:transition-colors [&_tbody_tr]:duration-150 [&_tbody_tr:hover]:bg-soft">
      <caption className="caption-top px-2 py-2 text-start text-base font-medium text-primary">{caption}</caption>{children}
    </table>
  </div>;
}
