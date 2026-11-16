import type { MetadataRoute } from "next";

// Robots allows crawling everywhere (public marketing site); the sitemap
// reference is added only when a real domain is configured.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export default function robots(): MetadataRoute.Robots {
  if (!SITE_URL) {
    return { rules: { userAgent: "*", allow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL.replace(/\/$/, "")}/sitemap.xml`,
  };
}
