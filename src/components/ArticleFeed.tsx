import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";

/**
 * One reusable component backing every Article Feed instance site-wide
 * (Homepage, Learn About ILIT x2, Blog Index x2, PDP "Articles by This
 * Practice", Blog article "More from the Blog"). Logic: pinned items
 * matching the filter (sorted by date) fill up to `limit` slots; if
 * `sameAuthorId` is set (contribution articles' "More from the Blog"),
 * remaining slots try same-author articles next; whatever's left fills with
 * the most recent non-pinned matching items by date. See PROJECT_SPEC.md
 * Section 3.
 */
export async function ArticleFeed({
  pinnedToSlot,
  tag,
  providerCreditedId,
  sameAuthorId,
  excludeArticleId,
  limit,
  emptyHidden = false,
}: {
  /** Admin-curated pin slot key, e.g. "homepage_recent". */
  pinnedToSlot?: string;
  tag?: string;
  providerCreditedId?: string;
  /** Slot 1 priority for contribution articles' "More from the Blog". */
  sameAuthorId?: string;
  /** Never show the article this feed is rendered on. */
  excludeArticleId?: string;
  limit: number;
  /** PDP "Articles by This Practice": hide the whole module if empty. */
  emptyHidden?: boolean;
}) {
  const baseWhere = {
    status: "PUBLISHED" as const,
    ...(tag ? { tags: { has: tag } } : {}),
    ...(providerCreditedId ? { providerCreditedId } : {}),
  };

  // Always excluded, on top of whichever slot's own already-picked IDs — kept
  // as a single `notIn` list (never mixed with a separate `not`) since two
  // `id` keys in one Prisma where object silently overwrite each other.
  const alwaysExcluded = excludeArticleId ? [excludeArticleId] : [];

  const pinned = pinnedToSlot
    ? await db.article.findMany({
        where: { ...baseWhere, pinnedTo: pinnedToSlot, id: { notIn: alwaysExcluded } },
        orderBy: { publishedDate: "desc" },
        take: limit,
        include: { author: true },
      })
    : [];

  const afterPinned = limit - pinned.length;
  const sameAuthor =
    sameAuthorId && afterPinned > 0
      ? await db.article.findMany({
          where: {
            ...baseWhere,
            authorId: sameAuthorId,
            id: { notIn: [...alwaysExcluded, ...pinned.map((a) => a.id)] },
          },
          orderBy: { publishedDate: "desc" },
          take: afterPinned,
          include: { author: true },
        })
      : [];

  const remaining = limit - pinned.length - sameAuthor.length;
  const fallback =
    remaining > 0
      ? await db.article.findMany({
          where: {
            ...baseWhere,
            id: { notIn: [...alwaysExcluded, ...pinned.map((a) => a.id), ...sameAuthor.map((a) => a.id)] },
          },
          orderBy: { publishedDate: "desc" },
          take: remaining,
          include: { author: true },
        })
      : [];

  const articles = [...pinned, ...sameAuthor, ...fallback];

  if (articles.length === 0 && emptyHidden) return null;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/blog/${article.slug}`}
          className="flex flex-col overflow-hidden rounded border border-line bg-white"
        >
          <div className="relative h-30 overflow-hidden bg-bg-alt">
            {article.featureImageUrl && (
              <Image src={article.featureImageUrl} alt={article.title} fill className="object-cover" />
            )}
          </div>
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
