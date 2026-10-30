export type TrackingEvent = {
  id: string;
  label: string;
  occurredAt: string;
  description?: string;
};
export type Shipment = {
  id: string;
  carrier?: string;
  trackingNumber?: string;
  status: string;
  events: TrackingEvent[];
  stale?: boolean;
};
export type ShipmentRequest = {
  orderId: string;
  carrier?: string;
  carrierOverrideReason?: string;
  lineIds?: string[];
};
