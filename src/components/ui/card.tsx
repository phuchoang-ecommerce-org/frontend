import type { ReactNode } from "react";
import {
  Card as PrimitiveCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "./primitives/card";

export type CardProps = {
  children: ReactNode;
  title?: string;
};

export function Card({ children, title }: CardProps) {
  return (
    <PrimitiveCard>
      {title && (
        <CardHeader>
          <CardTitle><h2>{title}</h2></CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </PrimitiveCard>
  );
}
