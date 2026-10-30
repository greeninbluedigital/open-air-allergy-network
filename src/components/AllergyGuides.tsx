import Link from "next/link";
import { readDb } from "@/lib/cache";
import { ArticleCard } from "@/components/ArticleCard";
import { articlePath } from "@/lib/blog";
import { COMPARISON_ARTICLE_SLUG, CORE_GUIDE_SLUGS, GUIDE_TAG } from "@/lib/content";

const RECENT = 3;
const LIST_MAX = 6;

/**
 * Learn About ILIT's "More Allergy Treatment Guides" (owner, 2026-10-20):
 * row 1 is the three core guides, fixed; row 2 is the three newest other
 * guides (tagged GUIDE_TAG, from either section); then a short text list of
 * up to LIST_MAX more and a link to the tag's Blog filter, so the page stays
 * the same length however many guides get published.
 */
export async function AllergyGuides() {
  const [core, rest] = await Promise.all([
    readDb.article.findMany({
      where: { slug: { in: [...CORE_GUIDE_SLUGS] }, status: "PUBLISHED" },
      include: { author: true },
    }),
    readDb.article.findMany({
      where: {
        status: "PUBLISHED",
        tags: { has: GUIDE_TAG },
        slug: { notIn: [...CORE_GUIDE_SLUGS, COMPARISON_ARTICLE_SLUG] },
      },
      orderBy: { publishedDate: "desc" },
      take: RECENT + LIST_MAX,
      include: { author: true },
    }),
  ]);
  const coreInOrder = CORE_GUIDE_SLUGS.flatMap((slug) => core.filter((a) => a.slug === slug));
  const recent = rest.slice(0, RECENT);
  const list = rest.slice(RECENT);

  return (
    <div className="space-y-5">
      {[coreInOrder, recent].map(
        (row, i) =>
          row.length > 0 && (
            <div key={i} className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {row.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ),
      )}
      {list.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-bold">More allergy guides</h3>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {list.map((article) => (
              <li key={article.id}>
                <Link href={articlePath(article)} className="font-semibold text-sage hover:underline">
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {rest.length > 0 && (
        <Link
          href={`/blog?tag=${encodeURIComponent(GUIDE_TAG)}`}
          className="inline-block text-sm font-semibold text-sage hover:underline"
        >
          See all allergy treatment guides →
        </Link>
      )}
    </div>
  );
}
