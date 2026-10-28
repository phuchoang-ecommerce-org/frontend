"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { logoutAction } from "@/features/identity/server/logout";
import { csrfToken } from "@/lib/session/client-csrf";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await logoutAction(await csrfToken());
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Sign-out is unavailable right now. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="secondary" loading={pending} onClick={() => void signOut()}>
        Sign out
      </Button>
      {error ? (
        <p className="max-w-xs text-end text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
