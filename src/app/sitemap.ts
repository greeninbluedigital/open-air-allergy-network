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

// Without this the sitemap is built once at deploy time and keeps listing
// whatever the database held then (it kept the example practices after the
// launch sync hid them). Same fix as the Learn About ILIT index.
export const dynamic = "force-dynamic";

/**
 * Listed in robots.txt and submitted in Search Console. Built from the
 * database on each request, so new practices and articles appear right after
 * a sync or publish.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [providers, articles] = await Promise.all([
    db.provider.findMany({
      where: { active: true, isDemo: false },
      select: { slug: true, updatedAt: true, contentUpdatedAt: true },
    }),
    db.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, section: true, publishedDate: true, lastUpdated: true },
    }),
  ]);

  return [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...providers.map((p) => ({ url: `${SITE_URL}/find-an-ilit-provider/${p.slug}`, lastModified: p.contentUpdatedAt ?? p.updatedAt })),
    ...articles.map((a) => ({
      url: `${SITE_URL}/${a.section === "LEARN" ? "learn-about-ilit" : "blog"}/${a.slug}`,
      // LEARN pages are evergreen ("Last reviewed") — lastUpdated is the
      // meaningful date. Blog stays on publishedDate, matching its display.
      lastModified: a.section === "LEARN" ? a.lastUpdated : (a.publishedDate ?? undefined),
    })),
  ];
}
