"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, StatusMessage } from "@/components/ui";
import { csrfToken } from "@/lib/session/client-csrf";
import { startCheckoutAction } from "../server/actions";

export function StartCheckoutButton() {
  const router = useRouter();
  const [result, setResult] = useState<{
    ok: boolean;
    message?: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  function start() {
    startTransition(() => {
      void csrfToken()
        .then(startCheckoutAction)
        .then((next) => {
          setResult(next);
          if (next.ok) router.refresh();
        })
        .catch(() =>
          setResult({
            ok: false,
            message: "Checkout could not be started. Try again.",
          }),
        );
    });
  }
  return (
    <div className="space-y-3">
      <Button loading={pending} onClick={start}>
        Start checkout
      </Button>
      {result && (
        <StatusMessage
          kind={result.ok ? "success" : "error"}
          message={
            result.ok
              ? (result.message ?? "Draft order created.")
              : (result.message ?? "Checkout could not be started.")
          }
        />
      )}
    </div>
  );
}
