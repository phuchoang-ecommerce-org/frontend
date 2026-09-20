import { AddressDetailScreen } from "@/features/identity/components/address-detail-screen";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AddressDetailPage({
  params,
}: {
  params: Promise<{ addressId: string }>;
}) {
  return <AddressDetailScreen params={params} />;
}
