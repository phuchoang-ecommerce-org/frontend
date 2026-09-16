import { createHmac, timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";

import { resolveCatalogRevalidation } from "@/features/catalog/server/revalidation";

export const runtime = "nodejs";

function signatureMatches(body: string, signature: string | null): boolean {
  const secret = process.env.ECP_REVALIDATE_SECRET;
  if (!secret || !signature?.startsWith("sha256=")) return false;

  const received = signature.slice("sha256=".length);
  if (!/^[a-f0-9]{64}$/.test(received)) return false;

  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(received, "hex"),
  );
}

/** Internal, signed ingress for catalog events; deliberately not public OpenAPI. */
export async function POST(request: Request): Promise<Response> {
  const body = await request.text();
  if (!signatureMatches(body, request.headers.get("X-ECP-Signature"))) {
    console.warn("Rejected catalog revalidation callback: invalid signature");
    return new Response(null, { status: 401 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    console.warn("Rejected catalog revalidation callback: malformed JSON");
    return new Response(null, { status: 400 });
  }

  const resolved = resolveCatalogRevalidation(parsed);
  if (resolved.kind === "invalid") {
    console.warn(
      "Rejected catalog revalidation callback: invalid catalog event",
    );
    return new Response(null, { status: 400 });
  }
  if (resolved.kind === "unknown") {
    console.warn("Ignored unsupported catalog revalidation event", resolved);
    return new Response(null, { status: 204 });
  }

  for (const tag of resolved.tags) revalidateTag(tag, "max");
  return new Response(null, { status: 204 });
}
