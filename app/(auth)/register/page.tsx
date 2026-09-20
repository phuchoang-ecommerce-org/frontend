import { RegisterForm } from "@/features/identity/components/register-form";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return <RegisterForm />;
}
