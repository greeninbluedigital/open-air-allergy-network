import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const STATIC_PATHS = [
  "",
  "/find-an-ilit-provider",
  "/learn-about-ilit",
  "/blog",
  "/for-practices",
  "/about",
];

/**
 * Exists now so it's ready the day robots.ts stops disallowing everything —
 * doesn't do anything on its own until then. See robots.ts for why crawling
 * is blocked site-wide right now.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [providers, articles] = await Promise.all([
    db.provider.findMany({
      where: { active: true, isDemo: false },
      select: { slug: true, updatedAt: true },
    }),
    db.article.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, publishedDate: true } }),
  ]);

  return [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...providers.map((p) => ({ url: `${SITE_URL}/find-an-ilit-provider/${p.slug}`, lastModified: p.updatedAt })),
    ...articles.map((a) => ({
      url: `${SITE_URL}/blog/${a.slug}`,
      lastModified: a.publishedDate ?? undefined,
    })),
  ];
}
