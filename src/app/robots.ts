import type { MetadataRoute } from "next";
import { TRAP_PATH } from "@/lib/scraperTrap";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Open to all crawlers since launch (2026-10-02). The only disallow is the
 * scraper trap, which is what makes the trap fair (docs/anti-scraping.md):
 * only bots that ignore robots.txt ever reach it. API routes carry their own
 * noindex header (next.config.ts).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: [TRAP_PATH] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
