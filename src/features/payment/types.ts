export type PaymentState =
  "pending" | "paid" | "failed" | "refunded" | "cash_on_delivery";
export type PaymentMethod = {
  type: string;
  label: string;
  description?: string;
  available: boolean;
};
export type RefundRequest = { amount: string; reason: string };
