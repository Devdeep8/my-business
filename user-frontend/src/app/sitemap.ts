import type { MetadataRoute } from "next";
import { publicBusinessService } from "@/services/publicBusiness.service";

// Sitemap is emitted only once a canonical domain is set via
// NEXT_PUBLIC_SITE_URL — no invented URLs go into the world.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!SITE_URL) return [];
  const base = SITE_URL.replace(/\/$/, "");
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = ["/", "/browse"].map((route) => ({
    url: `${base}${route}`,
    lastModified
  }));

  try {
    let page = 1;
    let totalPages = 1;
    do {
      const result = await publicBusinessService.list({ page, limit: 100 });
      entries.push(...result.items.map((business) => ({
        url: `${base}/b/${encodeURIComponent(business.slug)}`,
        lastModified
      })));
      totalPages = Math.min(result.pagination.totalPages, 100);
      page += 1;
    } while (page <= totalPages);
  } catch {
    // Keep the homepage and directory crawlable when the API is temporarily unavailable.
  }

  return entries;
}
