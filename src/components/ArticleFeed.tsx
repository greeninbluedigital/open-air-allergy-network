import Link from "next/link";
import { db } from "@/lib/db";

/**
 * One reusable component backing every Article Feed instance site-wide
 * (Homepage, Learn About ILIT x2, Blog Index x2, PDP "Articles by This
 * Practice"). Logic: pinned items matching the filter (sorted by date) fill
 * up to `limit` slots; any remaining slots fill with the most recent
 * non-pinned matching items by date. See PROJECT_SPEC.md Section 3.
 */
export async function ArticleFeed({
  pinnedToSlot,
  tag,
  providerCreditedId,
  limit,
  emptyHidden = false,
}: {
  /** Admin-curated pin slot key, e.g. "homepage_recent". */
  pinnedToSlot?: string;
  tag?: string;
  providerCreditedId?: string;
  limit: number;
  /** PDP "Articles by This Practice": hide the whole module if empty. */
  emptyHidden?: boolean;
}) {
  const baseWhere = {
    status: "PUBLISHED" as const,
    ...(tag ? { tags: { has: tag } } : {}),
    ...(providerCreditedId ? { providerCreditedId } : {}),
  };

  const pinned = pinnedToSlot
    ? await db.article.findMany({
        where: { ...baseWhere, pinnedTo: pinnedToSlot },
        orderBy: { publishedDate: "desc" },
        take: limit,
        include: { author: true },
      })
    : [];

  const remaining = limit - pinned.length;
  const fallback =
    remaining > 0
      ? await db.article.findMany({
          where: {
            ...baseWhere,
            id: { notIn: pinned.map((a) => a.id) },
          },
          orderBy: { publishedDate: "desc" },
          take: remaining,
          include: { author: true },
        })
      : [];

  const articles = [...pinned, ...fallback];

  if (articles.length === 0 && emptyHidden) return null;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/blog/${article.slug}`}
          className="flex flex-col overflow-hidden rounded border border-line bg-white"
        >
          <div className="h-30 bg-bg-alt" />
          <div className="flex flex-1 flex-col gap-1.5 p-3.5">
            <div className="text-sm font-bold">{article.title}</div>
            <div className="text-xs text-muted">
              {article.author ? `By ${article.author.name}` : "House"} ·{" "}
              {article.publishedDate?.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
