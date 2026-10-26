"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { logoutAction } from "@/features/identity/server/logout";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    if (pending) return;
    setPending(true);
    try {
      await logoutAction();
      router.replace("/login");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return <Button variant="secondary" loading={pending} onClick={() => void signOut()}>Sign out</Button>;
}
