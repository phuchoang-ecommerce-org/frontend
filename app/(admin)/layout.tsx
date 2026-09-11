import type { ReactNode } from "react";

import { AdminShell } from "@/components/layout";

// Required session (operator role), Strict cookie — dense operator
// navigation, no storefront chrome (Routing.md §2). Rendering an admin
// shell to a non-operator who has a session but the wrong role is correct
// behaviour, not a bug: this layout never checks role, only that proxy.ts
// let the request through. ecp-api enforces on every read/write; a
// CUSTOMER who reaches here sees empty sections and 403s behind every
// action (Security.md §13, threat T9).
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
