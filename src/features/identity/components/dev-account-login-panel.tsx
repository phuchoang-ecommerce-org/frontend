import { Card } from "@/components/ui";
import type { DevAccount, FormResult } from "../types";
import { DevAccountLoginButton } from "./dev-account-login-button";

export function DevAccountLoginPanel({
  accounts,
  returnTo,
  onSelect,
}: {
  accounts: DevAccount[];
  returnTo?: string;
  onSelect: (accountKey: string, returnTo?: string) => Promise<FormResult>;
}) {
  return (
    <Card title="Dev accounts">
      <ul className="divide-y divide-border">
        {accounts.map((account) => (
          <li
            key={account.key}
            className="flex flex-wrap items-center justify-between gap-3 py-3"
          >
            <div>
              <p className="break-all font-medium">{account.email}</p>
              <p className="text-sm text-muted-foreground">{account.role}</p>
            </div>
            <DevAccountLoginButton
              accountKey={account.key}
              label={`Sign in as ${account.key}`}
              returnTo={returnTo}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ul>
    </Card>
  );
}
