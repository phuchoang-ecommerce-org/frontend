import {
  VerifyEmailScreen,
  type VerifyEmailSearchParams,
} from "@/features/identity/components/verify-email-screen";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<VerifyEmailSearchParams>;
}) {
  return <VerifyEmailScreen searchParams={searchParams} />;
}
