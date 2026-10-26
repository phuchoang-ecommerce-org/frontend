"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, StatusMessage } from "@/components/ui";
import type { FormResult } from "../types";

export function VerifyEmailButton({
  token,
  onVerify,
}: {
  token: string;
  onVerify: (token: string) => Promise<FormResult>;
}) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<FormResult | null>(null);
  async function verify() {
    if (pending) return;
    setPending(true);
    try {
      setResult(await onVerify(token));
    } catch {
      setResult({ ok: false, message: "Verification could not be completed. Try again." });
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="space-y-3">
      <Button loading={pending} disabled={!token || result?.ok} onClick={() => void verify()}>
        Verify email
      </Button>
      {result && <StatusMessage kind={result.ok ? "success" : "error"} message={result.message ?? "Email verified."} />}
      {result?.ok && <Link href="/login" className="inline-block text-sm underline underline-offset-4">Go to sign-in</Link>}
    </div>
  );
}
