import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export type TagCount = { tag: string; count: number };

/** Auto-sorted by article count descending (Section 4 — Blog tag filter). */
export async function getTagCounts(): Promise<TagCount[]> {
  const articles = await db.article.findMany({
    where: { status: "PUBLISHED", section: "BLOG" },
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

const MILES_PER_METER = 1 / 1609.344;

/** Provider IDs within `radiusMiles` of the given point — used to filter
 * credited articles for the PAF module. */
async function providerIdsWithinRadius(lat: number, lng: number, radiusMiles: number): Promise<string[]> {
  const radiusMeters = radiusMiles / MILES_PER_METER;
  const rows = await db.$queryRaw<{ id: string }[]>(
    Prisma.sql`
      SELECT "id" FROM "Provider"
      WHERE "geog" IS NOT NULL
        AND ST_DWithin("geog", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusMeters})
    `,
  );
  return rows.map((r) => r.id);
}

export async function queryBlogArticles({
  tag,
  paf,
  page,
  pageSize,
}: {
  tag?: string;
  /** Provider Article Finder: filter by distance from a zip. */
  paf?: { lat: number; lng: number; radiusMiles: number };
  page: number;
  pageSize: number;
}) {
  const tagWhere = tag ? { tags: { has: tag } } : {};

  let pafWhere: Prisma.ArticleWhereInput = {};
  if (paf) {
    const eligibleIds = await providerIdsWithinRadius(paf.lat, paf.lng, paf.radiusMiles);
    const settings = await db.siteSetting.findUnique({ where: { id: 1 } });
    const excludeHouse = settings?.excludeHouseArticlesWhenPafActive ?? false;

    pafWhere = {
      OR: [
        { providerCreditedId: { in: eligibleIds } },
        ...(excludeHouse ? [] : [{ providerCreditedId: null }]),
      ],
    };
  }

  const where: Prisma.ArticleWhereInput = { status: "PUBLISHED", section: "BLOG", ...tagWhere, ...pafWhere };

  const [articles, totalCount] = await Promise.all([
    db.article.findMany({
      where,
      orderBy: { publishedDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { author: true },
    }),
    db.article.count({ where }),
  ]);

  return { articles, totalCount };
}
