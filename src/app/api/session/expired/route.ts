import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { CSRF_COOKIE } from "@/lib/session/csrf";

const SESSION_COOKIE = "ecp_session";

function safeReturnTo(request: NextRequest): string {
  const value = request.nextUrl.searchParams.get("returnTo");
  return value?.startsWith("/") && !value.startsWith("//") && !value.includes("\\")
    ? value
    : "/login";
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(CSRF_COOKIE);
  return NextResponse.redirect(new URL(safeReturnTo(request), request.url));
}
