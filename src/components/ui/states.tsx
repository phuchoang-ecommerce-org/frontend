"use client";

import { AlertCircle, Inbox } from "lucide-react";
import { Button } from "./primitives/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./primitives/card";

export type StateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

function StateContent({
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
  error,
}: StateProps & { error: boolean }) {
  const Icon = error ? AlertCircle : Inbox;
  return (
    <Card>
      <CardHeader>
        <Icon size={24} aria-hidden="true" />
        <CardTitle>
          <h2>{title}</h2>
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      {actionLabel && (actionHref || onAction) && (
        <CardFooter>
          {actionHref ? (
            <Button asChild>
              <a href={actionHref}>{actionLabel}</a>
            </Button>
          ) : (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

export function EmptyState(props: StateProps) {
  return <StateContent {...props} error={false} />;
}
export function ErrorState(props: StateProps) {
  return <StateContent {...props} error />;
}
