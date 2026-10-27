import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";

/**
 * A related-article card inside an article body (owner, 2026-10-27): the
 * linked article's hero thumbnail, title and description, so a key guide
 * isn't buried as a text link. Written in the Markdown as a link with the
 * title "card" on its own line:
 *
 *   [Dust mite allergy guide](/blog/dust-mite-allergy "card")
 *
 * Renders nothing if the article isn't published, so a card never points
 * at a missing page.
 */
export async function InlineArticleCard({ href }: { href: string }) {
  const match = href.match(/^\/(blog|learn-about-ilit)\/([a-z0-9-]+)$/);
  if (!match) return null;
  const article = await db.article.findFirst({
    where: { slug: match[2], section: match[1] === "blog" ? "BLOG" : "LEARN", status: "PUBLISHED" },
    select: { title: true, metaDescription: true, featureImageUrl: true, featureImageAlt: true },
  });
  if (!article) return null;

  return (
    <Link
      href={href}
      data-cta="article_inline_card"
      className="clear-both my-6 flex items-stretch overflow-hidden rounded border border-line bg-white transition-colors hover:border-muted hover:shadow-sm"
    >
      {article.featureImageUrl && (
        <div className="relative w-28 shrink-0 bg-bg-alt sm:w-40">
          <Image
            src={article.featureImageUrl}
            alt={article.featureImageAlt ?? article.title}
            fill
            sizes="160px"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-col justify-center gap-1 p-3.5">
        <div className="text-[11px] font-semibold tracking-wide text-muted uppercase">Related guide</div>
        <div className="text-sm font-bold">{article.title}</div>
        {article.metaDescription && (
          <div className="line-clamp-2 text-xs text-foreground/80">{article.metaDescription}</div>
        )}
      </div>
    </Link>
  );
}
