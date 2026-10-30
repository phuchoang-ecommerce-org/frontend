import { Badge, Card, EmptyState } from "@/components/ui";
import type { Shipment } from "@/lib/api/shipping";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusKind(status: string): "info" | "success" | "error" {
  if (status === "DELIVERED") return "success";
  if (["FAILED", "RETURNED"].includes(status)) return "error";
  return "info";
}

export function TrackingTimeline({
  shipments,
  orderStatus,
  estimatedDeliveryFrom,
  estimatedDeliveryTo,
}: {
  shipments: Shipment[];
  orderStatus: string;
  estimatedDeliveryFrom?: string;
  estimatedDeliveryTo?: string;
}) {
  if (!shipments.length)
    return (
      <EmptyState
        title="No shipment yet"
        message={`This order is currently ${orderStatus.replaceAll("_", " ").toLowerCase()}. Tracking will appear after it ships.`}
      />
    );
  return (
    <div className="space-y-4">
      {estimatedDeliveryFrom && estimatedDeliveryTo && (
        <p className="text-sm text-muted-foreground">
          Estimated delivery: {formatDate(estimatedDeliveryFrom)}–{formatDate(estimatedDeliveryTo)}
        </p>
      )}
      {shipments.map((shipment) => (
        <Card key={shipment.id} title={`Shipment ${shipment.id}`}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge label={shipment.status.replaceAll("_", " ")} kind={statusKind(shipment.status)} />
            <span className="text-sm text-muted-foreground">{shipment.carrier}</span>
          </div>
          {shipment.trackingReference && (
            <p className="mt-3 text-sm">
              Tracking reference: <span className="font-medium">{shipment.trackingReference}</span>
            </p>
          )}
          {shipment.lineIds?.length ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Order lines: {shipment.lineIds.join(", ")}
            </p>
          ) : null}
          {shipment.lastUpdateReceivedAt ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Last carrier update received {formatDate(shipment.lastUpdateReceivedAt)}.
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              We have not received a carrier update yet.
            </p>
          )}
          {shipment.carrierTrackingUrl && (
            <a
              className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
              href={shipment.carrierTrackingUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open carrier tracking
            </a>
          )}
          {shipment.trackingEvents?.length ? (
            <ol className="mt-4 space-y-4 border-s border-border ps-4">
              {shipment.trackingEvents.map((event) => (
                <li
                  key={event.id}
                  className="relative before:absolute before:-start-[1.31rem] before:top-1.5 before:size-2 before:rounded-full before:bg-foreground"
                >
                  <p className="font-medium">{event.status.replaceAll("_", " ")}</p>
                  <time
                    className="text-sm text-muted-foreground"
                    dateTime={event.carrierOccurredAt}
                  >
                    Reported by carrier {formatDate(event.carrierOccurredAt)}
                  </time>
                  {event.description && (
                    <p className="text-sm">{event.description}</p>
                  )}
                  {!event.applied && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Recorded on {formatDate(event.receivedAt)}; it did not change the current status.
                    </p>
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
