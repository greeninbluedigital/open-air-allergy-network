import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleDetail } from "@/lib/articles";
import { ArticleDetail } from "@/components/ArticleDetail";
import { stripMarkdown } from "@/lib/markdown";
import { truncateForMeta } from "@/lib/metadata";

async function getArticle(slug: string) {
  return getArticleDetail(slug, "LEARN");
}

export async function generateMetadata({
  params,
}: PageProps<"/learn-about-ilit/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  const description = truncateForMeta(
    article.summaryPoints.length > 0 ? article.summaryPoints.join(" ") : stripMarkdown(article.body),
  );
  return {
    // `absolute` skips the site-name template, same reasoning as PDP/Blog
    // titles — see docs/metadata-rules.md.
    title: { absolute: article.title },
    description,
    alternates: { canonical: `/learn-about-ilit/${slug}` },
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

export default async function LearnAboutIlitArticlePage({ params }: PageProps<"/learn-about-ilit/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return <ArticleDetail article={article} />;
}
