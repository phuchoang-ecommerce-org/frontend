import { Card, StatusMessage } from "@/components/ui";
import { getOrderPayment, type Payment } from "@/lib/api/payment";
import { formatMoney } from "@/lib/format/money";

function paymentLabel(status: string): string {
  return status.replaceAll("_", " ");
}

/**
 * Payment is intentionally isolated from the order snapshot: an unavailable
 * payment service must not prevent the customer from seeing their order.
 */
export async function OrderPaymentStatus({
  accessToken,
  orderId,
}: {
  accessToken: string;
  orderId: string;
}) {
  let payment: Payment | null = null;
  let unavailable = false;

  try {
    payment = await getOrderPayment(accessToken, orderId);
  } catch (error) {
    if (error instanceof Response && error.status === 404) return null;
    unavailable = true;
  }

  if (unavailable) {
    return (
      <StatusMessage
        kind="info"
        title="Payment details unavailable"
        message="Your order is still available. Check back shortly for payment updates."
      />
    );
  }
  if (!payment) return null;
  const amount = payment.capturedAmount ?? payment.authorisedAmount;
  return (
    <Card title="Payment">
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt>Status</dt>
          <dd className="font-medium">{paymentLabel(payment.status)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Method</dt>
          <dd>{payment.method.replaceAll("_", " ")}</dd>
        </div>
        {amount && (
          <div className="flex justify-between gap-3">
            <dt>Amount</dt>
            <dd className="tabular-nums">{formatMoney(amount)}</dd>
          </div>
        )}
      </dl>
    </Card>
  );
}
