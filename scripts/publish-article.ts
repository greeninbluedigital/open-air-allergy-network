/**
 * Publishes an article from a content-drafts/ file (the format used for
 * review: a metadata comment block, then the Markdown body after "BODY").
 *
 *   npx tsx scripts/publish-article.ts "content-drafts/my-article.md"
 *   npx tsx scripts/publish-article.ts "content-drafts/my-article.md" --dry-run
 *
 * Creates the article, or updates it if the slug already exists (keeping its
 * original publish date). FAQs are replaced with the draft's set.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { db } from "@/lib/db";
import { notifyIndexNow } from "@/lib/indexNow";

function field(meta: string, label: string): string | undefined {
  const m = meta.match(new RegExp(`^${label}(?: \\([^)]*\\))?:\\s*(.+)$`, "m"));
  return m?.[1].trim();
}

function block(meta: string, heading: string, next: string): string {
  const start = meta.indexOf(`${heading}\n`);
  if (start === -1) return "";
  const end = meta.indexOf(`\n${next}`, start);
  return meta.slice(start + heading.length + 1, end === -1 ? undefined : end).trim();
}

async function main() {
  const [file, flag] = process.argv.slice(2);
  if (!file) throw new Error("Usage: npx tsx scripts/publish-article.ts <draft file> [--dry-run]");
  const raw = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const split = raw.indexOf("BODY\n-->");
  if (split === -1) throw new Error('No "BODY" line found in the draft');
  const meta = raw.slice(0, split);
  const body = raw.slice(split + "BODY\n-->".length).trim();

  const section = field(meta, "Section") === "LEARN" ? "LEARN" : "BLOG";
  const title = field(meta, "Title");
  const url = field(meta, "URL");
  const slug = url?.split("/").filter(Boolean).pop();
  if (!title || !slug) throw new Error("Draft needs Title and URL");
  if (title.length > 62) throw new Error(`Title is ${title.length} characters (max 62, docs/metadata-rules.md)`);

  const metaDescription = field(meta, "Meta description");
  if (metaDescription && (metaDescription.length < 70 || metaDescription.length > 155)) {
    throw new Error(`Meta description is ${metaDescription.length} characters (70 to 155)`);
  }
  const tags = (field(meta, "Tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  const summaryPoints = block(meta, "KEY TAKEAWAYS", "FAQS")
    .split("\n")
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2).trim());
  const faqItems = [...block(meta, "FAQS", "SOURCES").matchAll(/^Q: (.+)\nA: (.+)$/gm)].map((m, i) => ({
    question: m[1].trim(),
    answer: m[2].trim(),
    sortOrder: i,
  }));

  const data = {
    section,
    status: "PUBLISHED" as const,
    title,
    body,
    tags,
    summaryPoints,
    metaDescription: metaDescription ?? null,
    featureImageUrl: field(meta, "Feature image") ?? null,
    featureImageAlt: field(meta, "Image alt") ?? null,
  } as const;

  console.log(`${section} /${section === "LEARN" ? "learn-about-ilit" : "blog"}/${slug}`);
  console.log(`  title (${title.length}): ${title}`);
  console.log(`  description (${metaDescription?.length ?? 0}): ${metaDescription ?? "(from Key Takeaways)"}`);
  console.log(`  tags: ${tags.join(", ")} | takeaways: ${summaryPoints.length} | FAQs: ${faqItems.length}`);
  console.log(`  image: ${data.featureImageUrl ?? "none"} | alt: ${data.featureImageAlt ?? "(title)"}`);
  console.log(`  body: ${body.split(/\s+/).length} words`);
  if (flag === "--dry-run") return;

  const existing = await db.article.findUnique({ where: { slug }, select: { id: true } });
  const article = existing
    ? await db.article.update({ where: { slug }, data })
    : await db.article.create({ data: { slug, ...data, publishedDate: new Date() } });
  await db.articleFaqItem.deleteMany({ where: { articleId: article.id } });
  if (faqItems.length > 0) {
    await db.articleFaqItem.createMany({ data: faqItems.map((f) => ({ ...f, articleId: article.id })) });
  }
  console.log(existing ? "updated" : "published");

  // The article and the index page that lists it.
  const index = section === "LEARN" ? "/learn-about-ilit" : "/blog";
  const indexNow = await notifyIndexNow([`${index}/${slug}`, index]);
  console.log(`  IndexNow: ${indexNow.submitted} URLs, ${indexNow.status}`);
}

main().finally(() => db.$disconnect());
