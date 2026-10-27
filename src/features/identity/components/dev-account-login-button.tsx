"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, StatusMessage } from "@/components/ui";
import { csrfToken } from "@/lib/session/client-csrf";
import type { FormResult } from "../types";
import { devAccountDestination } from "./dev-account-destination";

export function DevAccountLoginButton({
  accountKey,
  label,
  returnTo,
  pending = false,
  onSelect,
}: {
  accountKey: string;
  label: string;
  returnTo?: string | undefined;
  pending?: boolean | undefined;
  onSelect: (
    accountKey: string,
    returnTo: string | undefined,
    csrfToken: string,
  ) => Promise<FormResult>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function select() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await onSelect(accountKey, returnTo, await csrfToken());
      if (result.ok) {
        router.replace(devAccountDestination(accountKey));
        router.refresh();
      } else setError(result.message);
    } catch {
      setError("Sign-in could not be completed. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-2">
      <Button
        variant="secondary"
        loading={pending || busy}
        onClick={() => void select()}
      >
        {label}
      </Button>
      {error && <StatusMessage kind="error" message={error} />}
    </div>
  );
}
