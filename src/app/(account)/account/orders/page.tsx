import type { Metadata } from "next";
import { PageShell } from "@/components/layout";
import { ErrorState } from "@/components/ui";
import { OrderHistory } from "@/features/ordering/components/order-history";
import { listOrders } from "@/lib/api/ordering";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Your orders | ECP",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ cursor?: string | string[] }> };

function cursorFrom(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string" || !value || value.length > 2048) return undefined;
  return value;
}

export default async function OrdersPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) return null;
  const cursor = cursorFrom((await searchParams).cursor);
  let page;

  try {
    page = await listOrders(session.accessToken, cursor);
  } catch {
    return (
      <PageShell title="Your orders">
        <ErrorState
          title="Orders could not be loaded"
          message="Your order history is temporarily unavailable. Try again."
          actionLabel="Try again"
          actionHref="/account/orders"
        />
      </PageShell>
    );
  }

  return <PageShell title="Your orders"><OrderHistory page={page} {...(cursor ? { cursor } : {})} /></PageShell>;
}
