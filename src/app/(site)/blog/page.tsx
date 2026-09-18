import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ZipSearchForm } from "@/components/ZipSearchForm";
import { ArticleFeed } from "@/components/ArticleFeed";
import { getTagCounts, queryBlogArticles } from "@/lib/blog";
import { lookupZip } from "@/lib/zip";

export async function generateMetadata({ searchParams }: PageProps<"/blog">): Promise<Metadata> {
  const sp = await searchParams;
  const tag = typeof sp.tag === "string" ? sp.tag : undefined;
  // zip/radius/page are personalization/pagination, not distinct content —
  // canonical always drops them so those combinations don't get indexed as
  // separate near-duplicate URLs. `tag` does change the content meaningfully,
  // so it gets its own title/description and stays in the canonical.
  return {
    title: tag ? `${tag} Articles` : "Blog",
    description: tag
      ? `ILIT articles tagged "${tag}" from Open Air Allergy Network.`
      : "ILIT news, clinical research, and practice spotlights from Open Air Allergy Network.",
    alternates: { canonical: tag ? `/blog?tag=${encodeURIComponent(tag)}` : "/blog" },
  };
}

const ARCHIVE_PAGE_SIZE = 20;
const GRID_SIZE = 6;

function buildQuery(params: Record<string, string | undefined>) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) usp.set(k, v);
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export default async function BlogIndexPage({ searchParams }: PageProps<"/blog">) {
  const sp = await searchParams;
  const tag = typeof sp.tag === "string" ? sp.tag : undefined;
  const zip = typeof sp.zip === "string" ? sp.zip : undefined;
  const radius = typeof sp.radius === "string" ? parseInt(sp.radius, 10) || 50 : 50;
  const page = typeof sp.page === "string" ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  const location = zip ? lookupZip(zip) : null;
  const paf = location ? { lat: location.lat, lng: location.lng, radiusMiles: radius } : undefined;

  const [tagCounts, gridResult, archiveResult] = await Promise.all([
    getTagCounts(),
    queryBlogArticles({ tag, paf, page: 1, pageSize: GRID_SIZE }),
    queryBlogArticles({ tag, paf, page, pageSize: ARCHIVE_PAGE_SIZE }),
  ]);

  const totalPages = Math.max(1, Math.ceil(archiveResult.totalCount / ARCHIVE_PAGE_SIZE));
  const baseParams = { tag, zip, radius: zip ? String(radius) : undefined };

  return (
    <>
      <div className="px-6 pt-8 sm:px-10">
        <h1 className="text-3xl font-extrabold">Blog</h1>
      </div>

      <div className="border-b border-line px-6 py-8 sm:px-10">
        <div className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
          Featured
        </div>
        <ArticleFeed pinnedToSlot="blog_featured" limit={3} />
      </div>

      <div className="border-b border-line px-6 py-6 sm:px-10">
        <div className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
          Filter by Tag
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/blog${buildQuery({ zip, radius: baseParams.radius })}`}
            className={`rounded px-3 py-1 text-xs font-bold uppercase ${!tag ? "bg-foreground text-background" : "bg-bg-alt"}`}
          >
            All
          </Link>
          {tagCounts.map((t) => (
            <Link
              key={t.tag}
              href={`/blog${buildQuery({ ...baseParams, tag: t.tag })}`}
              className={`rounded px-3 py-1 text-xs font-bold uppercase ${tag === t.tag ? "bg-foreground text-background" : "bg-bg-alt"}`}
            >
              {t.tag} ({t.count})
            </Link>
          ))}
        </div>
      </div>

      <div className="border-b border-line px-6 py-6 sm:px-10">
        <div className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
          Find articles from providers near you
        </div>
        <ZipSearchForm action="/blog" showRadius defaultRadius={radius} buttonLabel="Filter" />
        {(tag || zip) && (
          <Link href="/blog" className="mt-2.5 inline-block text-xs text-muted">
            Clear Filters
          </Link>
        )}
      </div>

      <div className="border-b border-line px-6 py-8 sm:px-10">
        <div className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
          {tag || zip ? "Filtered Results" : "Recent Articles"}
        </div>
        {gridResult.articles.length === 0 ? (
          <p className="text-sm text-muted">No articles match these filters yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {gridResult.articles.map((article) => (
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
                    {article.publishedDate?.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-8 sm:px-10">
        <div className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
          Complete Archive
        </div>
        <div className="divide-y divide-line">
          {archiveResult.articles.map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.slug}`}
              className="flex items-center justify-between gap-4 py-2.5 text-sm hover:bg-bg-alt"
            >
              <span>{article.title}</span>
              <span className="shrink-0 text-xs whitespace-nowrap text-muted">
                {article.publishedDate?.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/blog${buildQuery({ ...baseParams, page: String(p) })}`}
                className={`rounded border px-3 py-1.5 ${p === page ? "border-foreground bg-foreground text-background" : "border-line"}`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
