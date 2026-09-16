import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Blanket disallow — deliberate, not an oversight. The site is being
 * deployed for the owner's own testing (real visual/content work still
 * pending), not for public discovery yet. Flip `disallow` to a real
 * allowlist (or remove this rule entirely) when it's actually ready to be
 * found — sitemap.ts is already built and waiting for that day.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
