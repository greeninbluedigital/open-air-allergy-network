/**
 * Read-only SEO audit: title, meta description, H1 and H2s for every
 * indexable page except blog articles and individual practice pages (one
 * sample of each practice page tier stands in for the template). Feeds the
 * "OAAN SEO audit" Google Sheet (docs/metadata-rules.md).
 *
 *   npx tsx scripts/seo-audit.ts                         # local dev server
 *   npx tsx scripts/seo-audit.ts http://localhost:3000 > audit.json
 *
 * Reads the pages over HTTP, so it audits what's actually rendered. Point it
 * at a local server: the live site's bot protection blocks scripted requests.
 */

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
// One Featured and one Freemium practice page, to show the template filled in.
const SAMPLE_PDPS = ["aspire-allergy-sinus-plano-tx", "avant-allergy-los-angeles-ca"];

const text = (s: string) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

// "ILIT" on its own reads as an irrevocable life insurance trust to Google
// (docs/content-pipeline.md): it needs "allergy" or the full name nearby.
const bareIlit = (s: string) => /\bILIT\b/.test(s) && !/allerg|intralymphatic/i.test(s);

function pageType(path: string): string {
  if (path === "/") return "Home";
  if (path === "/find-an-ilit-provider") return "Find a Provider (search)";
  if (path === "/find-an-ilit-provider/by-state") return "Providers by State";
  if (path.startsWith("/find-an-ilit-provider/")) return "State page";
  if (path === "/learn-about-ilit") return "Learn About ILIT";
  if (path.startsWith("/learn-about-ilit/")) return "Learn guide";
  if (path === "/blog") return "Blog index";
  return "Static page";
}

async function audit(path: string, type: string) {
  const html = await (await fetch(BASE + path)).text();
  const title = text(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
  const description = text(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
  const main = html.split("<main")[1] ?? html;
  const h1s = [...main.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => text(m[1]));
  const h2s = [...main.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => text(m[1])).filter(Boolean);

  const flags: string[] = [];
  if (title.length > 62) flags.push(`Title over 62 (${title.length})`);
  if (!description) flags.push("No meta description");
  else if (description.length < 70) flags.push(`Description under 70 (${description.length})`);
  else if (description.length > 155) flags.push(`Description over 155 (${description.length})`);
  // The brand suffix's "Allergy" doesn't count: it isn't next to "ILIT".
  if (bareIlit(title.replace(/ \| Open Air Allergy Network$/, ""))) flags.push('Title uses "ILIT" without "allergy"');
  if (description && bareIlit(description)) flags.push('Description uses "ILIT" without "allergy"');
  if (h1s.length !== 1) flags.push(`${h1s.length} H1s`);
  else if (bareIlit(h1s[0])) flags.push('H1 uses "ILIT" without "allergy"');
  else if (type.startsWith("Practice page") && !/\bILIT\b/.test(h1s[0])) flags.push('H1 has no "ILIT Provider in…" line');
  const bareH2s = h2s.filter(bareIlit).length;
  if (bareH2s) flags.push(`${bareH2s} H2s use "ILIT" without "allergy"`);

  return { type, path, title, description, h1: h1s.join(" / "), h2s, flags };
}

async function main() {
  const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const paths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((m) => m[1].replace(/^https?:\/\/[^/]+/, "") || "/")
    // Blog articles have their own metadata rules and passed review
    // 2026-10-26; practice pages share one template (sampled below).
    .filter((p) => !p.startsWith("/blog/") && !/^\/find-an-ilit-provider\/.+-[a-z]{2}$/.test(p));

  const rows = [];
  for (const p of paths) rows.push(await audit(p, pageType(p)));
  for (const slug of SAMPLE_PDPS) rows.push(await audit(`/find-an-ilit-provider/${slug}`, "Practice page (sample)"));

  // Flag titles and descriptions shared by more than one audited page.
  for (const field of ["title", "description"] as const) {
    const seen = new Map<string, number>();
    for (const r of rows) if (r[field]) seen.set(r[field], (seen.get(r[field]) ?? 0) + 1);
    for (const r of rows) if ((seen.get(r[field]) ?? 0) > 1) r.flags.push(`Duplicate ${field}`);
  }
  console.log(JSON.stringify(rows, null, 1));
}

main();
