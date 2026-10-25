"use client";

import { AlertCircle, Inbox } from "lucide-react";
import { Button } from "./button";
import { focusRing } from "./styles";

export type StateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

function StateContent({ title, message, actionLabel, actionHref, onAction, error }: StateProps & { error: boolean }) {
  const Icon = error ? AlertCircle : Inbox;
  return <section className="rounded-card border border-border bg-surface px-3 py-4 text-center font-ui sm:px-4">
    <Icon className="mx-auto mb-2 text-primary" size={24} aria-hidden="true" />
    <h2 className="text-xl font-semibold leading-tight text-primary">{title}</h2>
    <p className="mx-auto mt-1 max-w-md text-base leading-relaxed text-muted">{message}</p>
    {actionLabel && (actionHref ? <a href={actionHref} className={`mt-3 inline-flex min-h-control items-center justify-center rounded-control bg-primary px-2 text-sm font-medium text-surface hover:bg-primary/90 ${focusRing}`}>{actionLabel}</a> : onAction ? <div className="mt-3"><Button onClick={onAction}>{actionLabel}</Button></div> : null)}
  </section>;
}

export function EmptyState(props: StateProps) { return <StateContent {...props} error={false} />; }
export function ErrorState(props: StateProps) { return <StateContent {...props} error />; }
