import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Badge } from "@/components/Badge";
import { ArticleFeed } from "@/components/ArticleFeed";
import { stripMarkdown } from "@/lib/markdown";
import { cloudinaryFaceCrop } from "@/lib/cloudinary";

// Maps rendered Markdown elements to the site's existing type scale, rather
// than pulling in a Tailwind Typography plugin whose opinionated defaults
// would fight the hand-tuned classes used everywhere else on the site.
const markdownComponents = {
  h1: (props: React.ComponentProps<"h1">) => <h2 className="mt-6 mb-2 text-xl font-bold" {...props} />,
  h2: (props: React.ComponentProps<"h2">) => <h2 className="mt-6 mb-2 text-lg font-bold" {...props} />,
  h3: (props: React.ComponentProps<"h3">) => <h3 className="mt-5 mb-2 text-base font-bold" {...props} />,
  p: (props: React.ComponentProps<"p">) => <p className="mb-4" {...props} />,
  ul: (props: React.ComponentProps<"ul">) => <ul className="mb-4 list-disc space-y-1 pl-5" {...props} />,
  ol: (props: React.ComponentProps<"ol">) => <ol className="mb-4 list-decimal space-y-1 pl-5" {...props} />,
  strong: (props: React.ComponentProps<"strong">) => <strong className="font-semibold text-foreground" {...props} />,
  a: (props: React.ComponentProps<"a">) => (
    <a className="text-[#1c5ea8] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  img: (props: React.ComponentProps<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element -- Markdown body images have arbitrary author-pasted URLs, not known at build time.
    <img className="my-4 w-full rounded" {...props} alt={props.alt ?? ""} />
  ),
};

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

  const description = (
    article.summaryPoints.length > 0 ? article.summaryPoints.join(" ") : stripMarkdown(article.body)
  ).slice(0, 160);
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
    // Legitimate schema.org property, distinct from the FAQPage block below
    // — no dedicated structured-data type exists for a "key takeaways"
    // bullet list, so this is the closest real fit for it.
    abstract: article.summaryPoints.length > 0 ? article.summaryPoints.join(" ") : undefined,
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

      {article.summaryPoints.length > 0 && (
        <div className="mb-6 rounded border border-line bg-bg-alt p-4">
          <div className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Key Takeaways</div>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {article.summaryPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {article.featureImageUrl && (
        <div className="relative mb-6 h-64 overflow-hidden rounded bg-bg-alt sm:h-80">
          <Image src={article.featureImageUrl} alt={article.title} fill className="object-cover" />
        </div>
      )}

      {isContribution && article.providerCredited && (
        <div className="mb-6 flex items-center gap-3 rounded border border-badge-contrib-bg bg-badge-contrib-bg/30 p-3.5">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-bg-alt">
            {article.authorPhotoUrl && (
              <Image
                src={cloudinaryFaceCrop(article.authorPhotoUrl, 88)}
                alt={article.author!.name}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="text-sm">
            <div className="mb-1 flex flex-wrap gap-1.5">
              {article.providerCredited.foundingMember && <Badge variant="founder">Founding Member</Badge>}
              {article.providerCredited.tier !== "FREE_CLAIMED" && <Badge variant="verified">Verified</Badge>}
            </div>
            Contributed by <span className="font-semibold">{article.author!.name}</span> of{" "}
            <Link
              href={`/find-an-ilit-provider/${article.providerCredited.slug}`}
              className="font-semibold text-badge-contrib-text"
            >
              {article.providerCredited.practiceName}
            </Link>{" "}
            — view their full profile, contact and location →
            {article.author!.bio && (
              <p className="mt-2 text-xs text-foreground/80">{article.author!.bio}</p>
            )}
          </div>
        </div>
      )}

      <div className="text-sm text-foreground/80">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {article.body}
        </ReactMarkdown>
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
