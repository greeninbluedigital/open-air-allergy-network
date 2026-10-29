import type { ArticleCreditType, ArticleSection } from "@/generated/prisma/client";

/**
 * Article credits (2026-10-28). A practitioner can be credited on any
 * article, Blog or Learn, from the sheet's Article Credits tab, either as
 * the contributor ("Contributed by", they're the author) or as the medical
 * reviewer ("Medically reviewed by", OAAN stays the author). A credit shows
 * only once it's approved on that tab.
 */

/** The credit type, falling back to each section's default when unset. */
export function creditKind(article: { section: ArticleSection; creditType: ArticleCreditType | null }): ArticleCreditType {
  return article.creditType ?? (article.section === "LEARN" ? "MEDICALLY_REVIEWED" : "CONTRIBUTED");
}

/** Whether the credit shows: a practitioner and practice are linked, and the credit is approved. */
export function creditShows(article: {
  authorId: string | null;
  providerCreditedId: string | null;
  reviewApproved: boolean;
}): boolean {
  return Boolean(article.authorId && article.providerCreditedId && article.reviewApproved);
}

export const CREDIT_LABEL: Record<ArticleCreditType, string> = {
  CONTRIBUTED: "Contributed by",
  MEDICALLY_REVIEWED: "Medically reviewed by",
};

/** Prisma filter for articles whose credit shows. */
export const SHOWN_CREDIT = { reviewApproved: true, authorId: { not: null } } as const;
