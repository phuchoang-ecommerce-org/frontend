import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <form className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-primary">Sign in</h1>
      <Input type="email" name="email" aria-label="Email" placeholder="Email" required />
      <Input type="password" name="password" aria-label="Password" placeholder="Password" required />
      <Button type="submit">Sign in</Button>
    </form>
  );
}
