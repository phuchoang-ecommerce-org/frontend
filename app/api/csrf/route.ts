import { NextResponse } from "next/server";

import { mintCsrfCookieIfAbsent } from "@/lib/session";

// Closed route-handler list (Routing.md §9, ADR-0036): issues the ecp_csrf
// companion cookie only, never touches ecp_session. Mints only if absent —
// rotation happens on sign-in/sign-out, not per request (Frontend
// Architecture.md §4.3).
export async function GET() {
  await mintCsrfCookieIfAbsent();
  return new NextResponse(null, { status: 204 });
}
