import { db } from "@/lib/db";
import type { ArticleSection } from "@/generated/prisma/client";

export function getArticleDetail(slug: string, section: ArticleSection) {
  return db.article.findUnique({
    where: { slug, status: "PUBLISHED", section },
    include: {
      author: { include: { providers: { include: { provider: true } } } },
      providerCredited: true,
      faqItems: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export type ArticleDetailData = NonNullable<Awaited<ReturnType<typeof getArticleDetail>>>;

/** The "Traveling for ILIT" blog post, which the search page's out-of-area
 * section, state pages and Providers by State link to. */
export const TRAVEL_ARTICLE_SLUG = "traveling-for-ilit";

/** The travel article's URL once it's published, else null, so those links
 * switch on by themselves at publish and never point at a missing page.
 * Its section is read too, in case it's ever moved to Learn. */
export async function travelArticlePath(): Promise<string | null> {
  const article = await db.article.findUnique({
    where: { slug: TRAVEL_ARTICLE_SLUG, status: "PUBLISHED" },
    select: { section: true },
  });
  if (!article) return null;
  return `/${article.section === "LEARN" ? "learn-about-ilit" : "blog"}/${TRAVEL_ARTICLE_SLUG}`;
}
