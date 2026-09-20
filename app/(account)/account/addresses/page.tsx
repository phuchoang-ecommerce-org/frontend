import { AddressesPage } from "@/features/identity/components/addresses-page";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AccountAddressesPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  return <AddressesPage searchParams={await searchParams} />;
}
