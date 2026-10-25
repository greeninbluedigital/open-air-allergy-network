import { db } from "@/lib/db";
import { ILIT_DEFINITION } from "@/lib/content";
import { allStateMetroGroups } from "@/lib/statePages";
import { streetName } from "@/lib/address";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** One line per link, with a short description, per the llms.txt format. */
function line(title: string, path: string, description?: string | null): string {
  const text = description?.replace(/\s+/g, " ").trim();
  return `- [${title}](${SITE_URL}${path})${text ? `: ${text}` : ""}`;
}

/**
 * /llms.txt (llmstxt.org): a Markdown summary of the site for AI tools,
 * built from the database on each request (route handlers aren't cached),
 * so new articles, practices and states appear right after a publish or
 * sync. Same pages as the sitemap, with a description for each.
 */
export async function GET() {
  const [articles, states, providers] = await Promise.all([
    db.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, section: true, title: true, metaDescription: true, summaryPoints: true },
      orderBy: { publishedDate: "desc" },
    }),
    allStateMetroGroups(),
    db.provider.findMany({
      where: { active: true, isDemo: false },
      select: { slug: true, practiceName: true, city: true, state: true, address: true },
      orderBy: [{ state: "asc" }, { city: "asc" }, { practiceName: "asc" }],
    }),
  ]);

  const describe = (a: (typeof articles)[number]) => a.metaDescription ?? a.summaryPoints[0] ?? null;
  const learn = articles.filter((a) => a.section === "LEARN");
  const blog = articles.filter((a) => a.section === "BLOG");

  const body = [
    "# Open Air Allergy Network",
    "",
    "> A free, independent U.S. directory of allergy practices that offer ILIT (intralymphatic immunotherapy), with plain language articles on allergies and allergy treatment.",
    "",
    ILIT_DEFINITION,
    "",
    "Every practice is checked before it's listed: OAAN confirms it offers ILIT, from the practice's own published information or by contacting the practice directly. Practices OAAN has confirmed directly carry an ‘ILIT Confirmed’ badge. Scheduling, costs and other practice details can change, so check those with the practice. Articles cite named sources (AAFA, ACAAI, AAAAI, FDA, peer reviewed studies) and aren't medical advice: treatment decisions belong to a patient and their doctor.",
    "",
    "## Learn about ILIT",
    "",
    line("Learn About ILIT", "/learn-about-ilit", "What ILIT is, how it compares with allergy shots and allergy drops, safety, candidates and FAQs."),
    ...learn.map((a) => line(a.title, `/learn-about-ilit/${a.slug}`, describe(a))),
    "",
    "## Find an ILIT provider",
    "",
    line("Find an ILIT Provider", "/find-an-ilit-provider", "Search ILIT providers by zip code and distance."),
    line("ILIT Providers by State", "/find-an-ilit-provider/by-state", "Every state with an ILIT practice, with its metro areas."),
    ...states.map(({ state, groups }) => {
      const metros = groups.filter((g) => g.name).map((g) => g.name);
      return line(
        `ILIT Providers in ${state.name}`,
        `/find-an-ilit-provider/${state.slug}`,
        metros.length > 0 ? `Practices by metro area: ${metros.join(", ")}.` : null,
      );
    }),
    "",
    "## Blog",
    "",
    line("Blog", "/blog", "All articles and guides."),
    ...blog.map((a) => line(a.title, `/blog/${a.slug}`, describe(a))),
    "",
    "## About",
    "",
    line("About Open Air Allergy Network", "/about"),
    line("For Practices", "/for-practices", "How allergy practices can be listed."),
    line("Medical Disclaimer", "/legal/medical-disclaimer"),
    "",
    "## Optional",
    "",
    ...providers.map((p) => {
      // Two offices of one practice in one city: name the street, like the cards do.
      const twin = providers.some((o) => o.slug !== p.slug && o.practiceName === p.practiceName && o.city === p.city && o.state === p.state);
      const street = twin ? streetName(p.address) : null;
      return line(`${p.practiceName}, ${street ? `${street}, ` : ""}${p.city}, ${p.state}`, `/find-an-ilit-provider/${p.slug}`);
    }),
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
