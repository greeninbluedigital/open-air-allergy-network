import type { MetadataRoute } from "next";
import { TRAP_PATH } from "@/lib/scraperTrap";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Blanket disallow — deliberate, not an oversight. The site is being
 * deployed for the owner's own testing (real visual/content work still
 * pending), not for public discovery yet. Flip `disallow` to a real
 * allowlist (or remove this rule entirely) when it's actually ready to be
 * found — sitemap.ts is already built and waiting for that day.
 *
 * Keep the TRAP_PATH disallow when lifting the blanket rule: it's what makes
 * the scraper trap fair (docs/anti-scraping.md). Only bots that ignore
 * robots.txt ever reach it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: ["/", TRAP_PATH] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
