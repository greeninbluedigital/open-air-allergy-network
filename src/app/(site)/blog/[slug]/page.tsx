import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Badge } from "@/components/Badge";
import { ArticleFeed } from "@/components/ArticleFeed";

async function getArticle(slug: string) {
  return db.article.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: { include: { providers: { include: { provider: true } } } },
      providerCredited: true,
      faqItems: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  const description = article.body.slice(0, 160);
  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      images: article.featureImageUrl ? [article.featureImageUrl] : undefined,
      type: "article",
      publishedTime: article.publishedDate?.toISOString(),
    },
    twitter: { card: "summary_large_image", title: article.title, description },
  };
}

export default async function BlogArticlePage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const isContribution = Boolean(article.authorId && article.providerCredited);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.publishedDate?.toISOString(),
    dateModified: article.lastUpdated.toISOString(),
    author: article.author
      ? { "@type": "Person", name: article.author.name }
      : { "@type": "Organization", name: "Open Air Allergy Network" },
    image: article.featureImageUrl ?? undefined,
  };

  const faqJsonLd =
    article.faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: article.faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 sm:px-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <Link href="/blog" className="mb-3 inline-block text-xs text-muted">
        ← Back to Blog
      </Link>

      <div className="mb-2 flex flex-wrap gap-1.5">
        {article.tags.map((t) => (
          <Badge key={t} variant={isContribution ? "contrib" : "house"}>
            {t}
          </Badge>
        ))}
      </div>

      <h1 className="text-3xl font-extrabold">{article.title}</h1>
      <div className="mt-2 mb-6 text-xs text-muted">
        {article.author ? `By ${article.author.name}` : "Open Air Allergy Network"} · Published{" "}
        {article.publishedDate?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </div>

      {article.featureImageUrl && (
        <div className="relative mb-6 h-64 overflow-hidden rounded bg-bg-alt sm:h-80">
          <Image src={article.featureImageUrl} alt={article.title} fill className="object-cover" />
        </div>
      )}

      {isContribution && article.providerCredited && (
        <div className="mb-6 flex items-center gap-3 rounded border border-badge-contrib-bg bg-badge-contrib-bg/30 p-3.5">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-bg-alt">
            {article.authorPhotoUrl && (
              <Image src={article.authorPhotoUrl} alt={article.author!.name} fill className="object-cover" />
            )}
          </div>
          <div className="text-sm">
            <div className="mb-1 flex flex-wrap gap-1.5">
              {article.providerCredited.foundingMember && <Badge variant="founder">Founding Member</Badge>}
              {article.providerCredited.tier !== "FREE_CLAIMED" && <Badge variant="verified">Verified</Badge>}
            </div>
            Contributed by <span className="font-semibold">{article.author!.name}</span> of{" "}
            <Link
              href={`/find-a-provider/${article.providerCredited.slug}`}
              className="font-semibold text-badge-contrib-text"
            >
              {article.providerCredited.practiceName}
            </Link>{" "}
            — view their full profile, contact and location →
          </div>
        </div>
      )}

      <div className="prose prose-sm max-w-none text-sm whitespace-pre-line text-foreground/80">
        {article.body}
      </div>

      {article.faqItems.length > 0 && (
        <div className="mt-8 border-t border-line pt-6">
          <h2 className="mb-3 text-lg font-bold">Frequently Asked Questions</h2>
          {article.faqItems.map((item) => (
            <div key={item.id} className="border-b border-line py-2.5">
              <div className="text-sm font-semibold">{item.question}</div>
              <div className="mt-1 text-sm whitespace-pre-line text-muted">{item.answer}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 border-t border-line pt-6">
        <h2 className="mb-3 text-lg font-bold">More from the Blog</h2>
        <ArticleFeed
          sameAuthorId={isContribution ? (article.authorId ?? undefined) : undefined}
          excludeArticleId={article.id}
          limit={3}
        />
      </div>
    </div>
  );
}
