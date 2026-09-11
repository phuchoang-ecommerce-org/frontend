import type { MetadataRoute } from "next";

// R1 only (Routing.md §9): home, category, product detail are crawlable.
// Everything session-bearing or cart/checkout is not — "a cached account
// page is the failure this distinction prevents."
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/c", "/p"],
      disallow: ["/sign-in", "/register", "/account", "/admin", "/cart", "/checkout", "/api"],
    },
    sitemap: `${process.env.ECP_SITE_URL ?? "http://localhost:3000"}/sitemap.xml`,
  };
}
