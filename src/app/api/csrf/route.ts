import { NextResponse } from "next/server";
import { issueCsrfToken } from "@/lib/session/csrf";

export async function GET(): Promise<NextResponse> {
  const token = await issueCsrfToken();
  return NextResponse.json(
    { token },
    { headers: { "Cache-Control": "no-store" } },
  );
}
