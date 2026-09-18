import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";

async function getLegalPage(slug: string) {
  return db.legalPage.findUnique({ where: { slug } });
}

export async function generateMetadata({
  params,
}: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLegalPage(slug);
  if (!page) return {};
  // Boilerplate legal copy has no ranking value and is near-duplicate across
  // most sites — keep it reachable/linked (footer, compliance) but out of
  // search results and the sitemap.
  return { title: page.title, robots: { index: false, follow: true } };
}

/**
 * Six pages, one route (SiteFooter's LEGAL_LINKS) — content lives in the
 * LegalPage table so it's editable (Prisma Studio/SQL) without a code change
 * or redeploy, since these are expected to be revised as counsel reviews the
 * live site.
 */
export default async function LegalPage({ params }: PageProps<"/legal/[slug]">) {
  const { slug } = await params;
  const page = await getLegalPage(slug);
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 sm:px-10">
      <h1 className="mb-6 text-2xl font-extrabold">{page.title}</h1>
      <div
        className="text-sm text-foreground/80 [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_p]:mb-3"
        // Trusted, owner/counsel-authored content — same trust boundary as
        // extendedBio/Yelp embeds elsewhere in the app.
        dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
      />
    </div>
  );
}
