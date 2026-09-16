import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const STATIC_PATHS = [
  "",
  "/find-a-provider",
  "/learn-about-ilit",
  "/blog",
  "/for-practices",
  "/about",
];

const LEGAL_SLUGS = [
  "privacy-notice",
  "terms-and-conditions",
  "cookie-policy",
  "privacy-choices",
  "medical-disclaimer",
  "accessibility-statement",
];

/**
 * Exists now so it's ready the day robots.ts stops disallowing everything —
 * doesn't do anything on its own until then. See robots.ts for why crawling
 * is blocked site-wide right now.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [providers, articles] = await Promise.all([
    db.provider.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    db.article.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, publishedDate: true } }),
  ]);

  return [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...LEGAL_SLUGS.map((slug) => ({ url: `${SITE_URL}/legal/${slug}` })),
    ...providers.map((p) => ({ url: `${SITE_URL}/find-a-provider/${p.slug}`, lastModified: p.updatedAt })),
    ...articles.map((a) => ({
      url: `${SITE_URL}/blog/${a.slug}`,
      lastModified: a.publishedDate ?? undefined,
    })),
  ];
}
