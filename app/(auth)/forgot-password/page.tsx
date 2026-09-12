import { ForgotPasswordForm } from "@/features/identity/components/forgot-password-form";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
