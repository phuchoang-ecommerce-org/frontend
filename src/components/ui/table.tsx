import type { ReactNode } from "react";
import { Table as PrimitiveTable, TableCaption } from "./primitives/table";

export {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./primitives/table";

export type TableProps = { children: ReactNode; caption: string };

export function Table({ children, caption }: TableProps) {
  return (
    <PrimitiveTable>
      <TableCaption>{caption}</TableCaption>
      {children}
    </PrimitiveTable>
  );
}
