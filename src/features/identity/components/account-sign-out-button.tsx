"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { csrfToken } from "@/lib/session/client-csrf";
import type { FormResult } from "../types";

export function AccountSignOutButton({
  onSignOut,
}: {
  onSignOut: (csrfToken: string) => Promise<FormResult>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await onSignOut(await csrfToken());
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Sign-out is unavailable right now. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="quiet" loading={pending} onClick={() => void signOut()}>
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
