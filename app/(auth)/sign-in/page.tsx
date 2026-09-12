import { SignInForm } from "./sign-in-form";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function SignInPage() {
  return <SignInForm />;
}
