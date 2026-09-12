import { getOwnAccount } from "@/features/identity/server/queries";
import { ProfileForm } from "@/features/identity/components/profile-form";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const account = await getOwnAccount();
  return <ProfileForm account={account} />;
}
