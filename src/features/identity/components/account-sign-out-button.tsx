"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { csrfToken } from "@/lib/session/client-csrf";

export function AccountSignOutButton({
  onSignOut,
}: {
  onSignOut: (csrfToken: string) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function signOut() {
    setPending(true);
    try {
      await onSignOut(await csrfToken());
      router.replace("/");
      router.refresh();
    } finally {
      setPending(false);
    }
  }
  return <Button variant="quiet" loading={pending} onClick={() => void signOut()}>Sign out</Button>;
}
