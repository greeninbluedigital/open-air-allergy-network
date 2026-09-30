/**
 * Publishes the legal pages from docs/legal-pages/*.html to the LegalPage
 * table (the live site reads them from there, no deploy needed).
 *
 *   npx tsx scripts/publish-legal-pages.ts            # every page
 *   npx tsx scripts/publish-legal-pages.ts cookie-policy
 *
 * The HTML files are the source of truth: edit them (e.g. with the
 * attorney's changes), then run this. Pages without a file here, like the
 * Medical Disclaimer until it's written, are left untouched.
 */
import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { db } from "@/lib/db";

const TITLES: Record<string, string> = {
  "privacy-notice": "Privacy Policy",
  "terms-and-conditions": "Terms & Conditions",
  "cookie-policy": "Cookie Policy",
  "privacy-choices": "My Privacy Choices",
  "medical-disclaimer": "Medical Disclaimer",
  "accessibility-statement": "Accessibility Statement",
};

async function main() {
  const requested = process.argv.slice(2);
  const slugs = requested.length > 0 ? requested : Object.keys(TITLES);
  for (const slug of slugs) {
    const title = TITLES[slug];
    if (!title) throw new Error(`Unknown legal page: ${slug}`);
    const file = join("docs", "legal-pages", `${slug}.html`);
    if (!existsSync(file)) {
      console.log(`skipped ${slug} (no ${file})`);
      continue;
    }
    const bodyHtml = readFileSync(file, "utf8");
    await db.legalPage.upsert({ where: { slug }, update: { title, bodyHtml }, create: { slug, title, bodyHtml } });
    console.log(`published ${slug} (${bodyHtml.length} chars)`);
  }
}

main().finally(() => db.$disconnect());
