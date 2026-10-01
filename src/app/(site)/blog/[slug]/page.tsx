import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleDetail } from "@/lib/articles";
import { ArticleDetail } from "@/components/ArticleDetail";
import { stripMarkdown } from "@/lib/markdown";
import { truncateForMeta } from "@/lib/metadata";

async function getArticle(slug: string) {
  return getArticleDetail(slug, "BLOG");
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  // Titles use `absolute` to skip the root layout's " | Open Air Allergy
  // Network" template — that 28-char suffix alone pushed every real article
  // title (including this user-chosen headline) past the 62-char budget.
  const description = truncateForMeta(
    article.metaDescription ??
      (article.summaryPoints.length > 0 ? article.summaryPoints.join(" ") : stripMarkdown(article.body)),
  );
  return {
    title: { absolute: article.title },
    description,
    alternates: { canonical: `/blog/${slug}` },
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

  return <ArticleDetail article={article} />;
}
