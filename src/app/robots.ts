import type { MetadataRoute } from "next";
import { TRAP_PATH } from "@/lib/scraperTrap";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Open to all crawlers since launch (2026-10-02). Disallowed: the scraper
 * trap, which is what makes the trap fair (docs/anti-scraping.md): only bots
 * that ignore robots.txt ever reach it, Next.js page data URLs (?_rsc=), and
 * /api/ (2026-10-18: Googlebot was calling /api/events while rendering pages;
 * that route also drops bot user agents itself). API routes also carry their
 * own noindex header (next.config.ts). Pages never need /api/ to render, and
 * form posts from real visitors aren't affected by robots.txt.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    // Next.js prefetches each visible link's page data at ?_rsc=…, and
    // Googlebot was spending about 65% of its crawl budget on those (Crawl
    // stats, 2026-10-15). Every page's content is already in its HTML, so
    // skipping them loses nothing for indexing.
    rules: { userAgent: "*", disallow: [TRAP_PATH, "/*?_rsc=", "/*&_rsc=", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
