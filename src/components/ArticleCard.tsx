import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@/generated/prisma/client";

export type ArticleCardData = Prisma.ArticleGetPayload<{ include: { author: true } }>;

export function ArticleCard({ article }: { article: ArticleCardData }) {
  const isLearn = article.section === "LEARN";
  // Same gating as the article page itself (ArticleDetail.tsx) — a
  // staged-but-unapproved LEARN credit shouldn't show the author name here
  // either, even though this component doesn't render the full credit box.
  const isContribution = Boolean(article.authorId && article.providerCreditedId);
  const showCredit = isLearn ? isContribution && article.reviewApproved : isContribution;
  return (
    <Link
      href={`/${isLearn ? "learn-about-ilit" : "blog"}/${article.slug}`}
      className="flex flex-col overflow-hidden rounded border border-line bg-white"
    >
      <div className="relative h-30 overflow-hidden bg-bg-alt">
        {article.featureImageUrl && (
          <Image
            src={article.featureImageUrl}
            alt={article.title}
            fill
            sizes="(min-width: 640px) 33vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="text-sm font-bold">{article.title}</div>
        {isLearn ? (
          // No date, no "By"/"Medically reviewed by" label — just the
          // doctor's name when there's an approved credit, nothing at all
          // otherwise. Keeps tiles small; the name alone still signals
          // credibility without spending space on a label.
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
}
