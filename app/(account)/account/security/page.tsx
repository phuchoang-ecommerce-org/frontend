import { PasswordChangeForm } from "@/features/identity/components/password-change-form";
import { EndAllSessionsForm } from "@/features/identity/components/end-all-sessions-form";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function SecurityPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-primary">Security</h1>
      <PasswordChangeForm />
      <EndAllSessionsForm />
    </div>
  );
}
