import type { MetadataRoute } from "next";

// R1 only (Routing.md §9). Category (/c/...) and product (/p/...) entries
// are added once features/catalog exposes a listing to enumerate from —
// that feature doesn't exist yet (later-sprint scope); this establishes
// the shell with the one route that does.
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.ECP_SITE_URL ?? "http://localhost:3000";
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
