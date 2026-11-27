import { Prisma } from "@/generated/prisma/client";
import { readDb } from "@/lib/cache";
import { SHOWN_CREDIT } from "@/lib/credits";
import { REGIONAL_SLUGS } from "@/lib/regionalArticles";
import { providerIdsWithinRadius } from "@/lib/nearbyProviders";

export type TagCount = { tag: string; count: number };

/** The Blog index lists Learn guides too (labeled "Learn", linking to their
 * /learn-about-ilit URLs), so readers browsing the Blog see every new
 * allergen and city guide without a companion post (2026-10-10). */
const BLOG_FEED_SECTIONS: ("BLOG" | "LEARN")[] = ["BLOG", "LEARN"];

export function articlePath(a: { section: string; slug: string }): string {
  return `/${a.section === "LEARN" ? "learn-about-ilit" : "blog"}/${a.slug}`;
}

/** Auto-sorted by article count descending (Section 4 — Blog tag filter). */
export async function getTagCounts(): Promise<TagCount[]> {
  const articles = await readDb.article.findMany({
    where: { status: "PUBLISHED", section: { in: BLOG_FEED_SECTIONS } },
    select: { tags: true },
  });

  const counts = new Map<string, number>();
  for (const article of articles) {
    for (const tag of article.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}


export async function queryBlogArticles({
  tag,
  practiceId,
  paf,
  page,
  pageSize,
  offset = 0,
}: {
  tag?: string;
  /** Only articles credited to this practice (the PDP's "See more articles
   * from …" link), counting only credits that actually show. */
  practiceId?: string;
  /** Provider Article Finder: filter by distance from a zip. `regionalSlugs`
   * are the regional house guides near that zip; the others (a Houston
   * guide for a Kansas City zip) drop out (src/lib/regionalArticles.ts). */
  paf?: { lat: number; lng: number; radiusMiles: number; regionalSlugs: string[] };
  page: number;
  pageSize: number;
  /** Articles to skip before paging starts, e.g. the ones already shown in
   * the Blog's card grid, so the list below doesn't repeat them. */
  offset?: number;
}) {
  const tagWhere = tag ? { tags: { has: tag } } : {};

  let pafWhere: Prisma.ArticleWhereInput = {};
  if (paf) {
    const eligibleIds = await providerIdsWithinRadius(paf.lat, paf.lng, paf.radiusMiles);
    const settings = await readDb.siteSetting.findUnique({ where: { id: 1 } });
    const excludeHouse = settings?.excludeHouseArticlesWhenPafActive ?? false;

    const farRegional = REGIONAL_SLUGS.filter((s) => !paf.regionalSlugs.includes(s));
    pafWhere = {
      OR: [
        { providerCreditedId: { in: eligibleIds } },
        // House articles: regional guides near the zip always count (even
        // with excludeHouse on); other house articles follow the setting.
        { providerCreditedId: null, slug: { in: paf.regionalSlugs } },
        ...(excludeHouse ? [] : [{ providerCreditedId: null, slug: { notIn: farRegional } }]),
      ],
    };
  }

  const where: Prisma.ArticleWhereInput = {
    status: "PUBLISHED",
    section: { in: BLOG_FEED_SECTIONS },
    ...tagWhere,
    ...pafWhere,
    ...(practiceId ? { providerCreditedId: practiceId, ...SHOWN_CREDIT } : {}),
  };

  const [articles, totalCount] = await Promise.all([
    readDb.article.findMany({
      where,
      orderBy: { publishedDate: "desc" },
      skip: offset + (page - 1) * pageSize,
      take: pageSize,
      include: { author: true },
    }),
    readDb.article.count({ where }),
  ]);

  return { articles, totalCount: Math.max(0, totalCount - offset) };
}
