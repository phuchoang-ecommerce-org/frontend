import { Card, EmptyState } from "@/components/ui";
import type { Shipment } from "../types";

export function TrackingTimeline({ shipments }: { shipments: Shipment[] }) {
  if (!shipments.length)
    return (
      <EmptyState
        title="No shipment yet"
        message="Tracking will appear after the order ships."
      />
    );
  return (
    <div className="space-y-4">
      {shipments.map((shipment) => (
        <Card key={shipment.id} title={`Shipment ${shipment.id}`}>
          <p className="text-sm">
            {shipment.status}
            {shipment.carrier && ` · ${shipment.carrier}`}
            {shipment.trackingNumber && ` · ${shipment.trackingNumber}`}
          </p>
          {shipment.stale && (
            <p className="mt-2 text-sm text-muted-foreground">
              Carrier updates may be out of date.
            </p>
          )}
          {shipment.events.length ? (
            <ol className="mt-4 space-y-4 border-s border-border ps-4">
              {shipment.events.map((event) => (
                <li
                  key={event.id}
                  className="relative before:absolute before:-start-[1.31rem] before:top-1.5 before:size-2 before:rounded-full before:bg-foreground"
                >
                  <p className="font-medium">{event.label}</p>
                  <time
                    className="text-sm text-muted-foreground"
                    dateTime={event.occurredAt}
                  >
                    {event.occurredAt}
                  </time>
                  {event.description && (
                    <p className="text-sm">{event.description}</p>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Tracking has not started.
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
