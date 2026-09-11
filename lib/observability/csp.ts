// The CSP/static-generation trade named in Sprint 2's Integration Risk
// (Performance.md §7): R1 routes (home, category, product detail) stay
// statically generated and cacheable, verified by Subresource Integrity
// (next.config.ts's `experimental.sri`) instead of a nonce. Every other
// route class is already dynamically rendered (ADR-0019) and gets a
// per-request nonce from proxy.ts.
//
// This is a trade, not a solved problem (Performance.md §7): the R1 static
// CSP has no nonce because it has no per-request value to embed — SRI
// hashes are produced at build time. If a Next.js upgrade changes the
// framework's inline bootstrap in a way SRI can't cover, the fallback is
// documented in Performance.md §7 (relax the P1 TTFB budget), not silently
// weakening the policy here.

const R1_PATH_PATTERNS = [/^\/$/, /^\/c(\/.*)?$/, /^\/p(\/.*)?$/];

export function isR1Path(pathname: string): boolean {
  return R1_PATH_PATTERNS.some((pattern) => pattern.test(pathname));
}

const SHARED_DIRECTIVES = `
  default-src 'self';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

function normalize(header: string): string {
  return header.replace(/\s{2,}/g, " ").trim();
}

/** R1 only — no nonce, verified by SRI at build time, safe to cache. */
export function buildStaticCsp(): string {
  return normalize(`
    ${SHARED_DIRECTIVES}
    script-src 'self';
    style-src 'self';
  `);
}

/** R2-R4 — one nonce per request, requires dynamic rendering. */
export function buildNonceCsp(nonce: string, isDev: boolean): string {
  return normalize(`
    ${SHARED_DIRECTIVES}
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`};
  `);
}

export function newNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}
