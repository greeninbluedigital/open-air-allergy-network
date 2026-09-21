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
