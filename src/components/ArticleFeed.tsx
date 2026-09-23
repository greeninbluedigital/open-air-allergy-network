import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import type { ArticleSection } from "@/generated/prisma/client";

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
  section = "BLOG",
  providerCreditedId,
  sameAuthorId,
  excludeArticleId,
  limit,
  emptyHidden = false,
  oldestFirst = false,
  providerCreditedOnly = false,
}: {
  /** Admin-curated pin slot key, e.g. "homepage_recent". */
  pinnedToSlot?: string;
  tag?: string;
  /** Defaults to BLOG so every pre-existing call site keeps showing only
   * blog posts, not the newer /learn-about-ilit/[slug] cluster pages.
   * "ALL" opts out of the filter entirely — used by the PDP's "Articles
   * From This Practice", which should show everything a provider is
   * credited on regardless of section. */
  section?: ArticleSection | "ALL";
  providerCreditedId?: string;
  /** Slot 1 priority for contribution articles' "More from the Blog". */
  sameAuthorId?: string;
  /** Never show the article this feed is rendered on. */
  excludeArticleId?: string;
  limit: number;
  /** PDP "Articles by This Practice": hide the whole module if empty. */
  emptyHidden?: boolean;
  /** Learn About ILIT's nav module: oldest-first instead of the default
   * newest-first, since the user wants the first cluster pages published
   * (the ones they consider the most foundational reading) to appear first
   * in a small, capped-at-~6 list — not treated like a recency-driven feed. */
  oldestFirst?: boolean;
  /** Learn About ILIT's "From Our Provider Network" module: only articles
   * actually credited to a provider — house content (no credit) never
   * belongs in a section making that specific claim, even if it's
   * otherwise a recent BLOG article. */
  providerCreditedOnly?: boolean;
}) {
  const orderBy = { publishedDate: oldestFirst ? ("asc" as const) : ("desc" as const) };
  const baseWhere = {
    status: "PUBLISHED" as const,
    ...(section !== "ALL" ? { section } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
    ...(providerCreditedId ? { providerCreditedId } : {}),
    ...(providerCreditedOnly ? { providerCreditedId: { not: null } } : {}),
  };

  // Always excluded, on top of whichever slot's own already-picked IDs — kept
  // as a single `notIn` list (never mixed with a separate `not`) since two
  // `id` keys in one Prisma where object silently overwrite each other.
  const alwaysExcluded = excludeArticleId ? [excludeArticleId] : [];

  const pinned = pinnedToSlot
    ? await db.article.findMany({
        where: { ...baseWhere, pinnedTo: pinnedToSlot, id: { notIn: alwaysExcluded } },
        orderBy,
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
          orderBy,
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
          orderBy,
          take: remaining,
          include: { author: true },
        })
      : [];

  const articles = [...pinned, ...sameAuthor, ...fallback];

  if (articles.length === 0 && emptyHidden) return null;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      {articles.map((article) => {
        const isLearn = article.section === "LEARN";
        // Same gating as the article page itself (ArticleDetail.tsx) — a
        // staged-but-unapproved LEARN credit shouldn't show the author name
        // here either, even though this component doesn't render the full
        // credit box.
        const isContribution = Boolean(article.authorId && article.providerCreditedId);
        const showCredit = isLearn ? isContribution && article.reviewApproved : isContribution;
        return (
          <Link
            key={article.id}
            href={`/${isLearn ? "learn-about-ilit" : "blog"}/${article.slug}`}
            className="flex flex-col overflow-hidden rounded border border-line bg-white"
          >
            <div className="relative h-30 overflow-hidden bg-bg-alt">
              {article.featureImageUrl && (
                <Image src={article.featureImageUrl} alt={article.title} fill className="object-cover" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1.5 p-3.5">
              <div className="text-sm font-bold">{article.title}</div>
              {isLearn ? (
                // No date, no "By"/"Medically reviewed by" label — just the
                // doctor's name when there's an approved credit, nothing at
                // all otherwise. Keeps tiles small; the name alone still
                // signals credibility without spending space on a label.
                showCredit && <div className="text-xs text-muted">{article.author!.name}</div>
              ) : (
                <div className="text-xs text-muted">
                  {article.author && <>By {article.author.name} · </>}
                  {article.publishedDate?.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
