# Search watch: monthly search guidance and site audit

Set up 2026-10-25 at the owner's request. A local scheduled task
(`oaan-monthly-search-watch`, the 3rd of each month at 9 AM) checks for new
Google, Bing and AI search guidance, audits the site against it, and saves
a report here as `YYYY-MM.md`. It never changes the site. The owner reads
the report and the main session makes the fixes.

## Sources to check every month

**Google (official)**
- Search Central documentation updates log: https://developers.google.com/search/updates
- Search Central blog: https://developers.google.com/search/blog
- Search status dashboard (core and spam updates): https://status.search.google.com/
- AI features and your website (AI Overviews, AI Mode): https://developers.google.com/search/docs/appearance/ai-features
- Generative AI content guidance: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- Helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Spam policies (scaled content abuse, site reputation abuse): https://developers.google.com/search/docs/essentials/spam-policies

**Bing** (also feeds ChatGPT search and Copilot)
- Bing Webmaster blog: https://blogs.bing.com/webmaster
- Bing Webmaster Guidelines: https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a

**AI search and crawlers**
- OpenAI crawlers (OAI-SearchBot, GPTBot): https://platform.openai.com/docs/bots
- Perplexity crawlers: https://docs.perplexity.ai/guides/bots
- Anthropic crawlers (ClaudeBot, Claude-SearchBot, Claude-User): search Anthropic's support site for "crawler"
- llms.txt standard: https://llmstxt.org/

**Industry news** (to catch what official sources only hint at)
- Search Engine Roundtable: https://www.seroundtable.com/
- Search Engine Land: https://searchengineland.com/ (blocks automated page reads; find its stories through web search instead)

**Allergy guidelines to watch for**
- Final publication of the 2026 AAAAI/ACAAI Allergen Immunotherapy Practice
  Parameter (draft posted for review 2026-08-24; recommendations 98 and 99
  cover ILIT). When it's published (likely JACI or Annals of Allergy, Asthma
  & Immunology), flag it as a top fix: cite it on the Learn page and draft
  the planned article (see docs/content-ideas.md).

Add a source here when a report finds a better one.

## What OAAN already does (baseline, 2026-10-25)

- **Content process:** every fact linked to a named source; an independent
  fact check pass on every draft (body, takeaways, FAQs, title, meta
  description, alt text); the owner reviews every article; a main session
  final pass before publishing (`docs/content-pipeline.md`).
- **AI disclosure:** the About page's "How We Create Our Content" section
  says AI tools help research and draft, and every article is checked
  against its sources and reviewed by an editor (Google's 2026-10-01
  generative AI guidance).
- **Scaled content guardrail:** local articles only where local data
  genuinely differs; no near-identical city pages; no practice lists in
  articles; national authority framing.
- **Metadata:** rules in `docs/metadata-rules.md`; titles 62 characters or
  fewer, descriptions 70 to 155.
- **Structured data:** Article (author = Organization, dateModified) and
  FAQPage on articles; Organization with sameAs on the homepage;
  practice pages have their own schema (`src/app/(site)/find-an-ilit-provider/[slug]/page.tsx`).
- **Crawling:** `src/app/robots.ts` (AI search bots allowed; scraper trap
  disallowed), `src/app/sitemap.ts`, `src/app/llms.txt/route.ts`, IndexNow
  on publish.
- **Known open items:** Core Web Vitals parked until Search Console has
  real visitor data; mobile lab score 79 (GTM loads early).

## Report format (`YYYY-MM.md`)

1. **What changed since last month:** each new or updated guidance item,
   with its date, a link, one line on what it says, and whether it affects
   OAAN (yes, no, watch).
2. **Audit findings:** site-wide checks, then the rotating article sample.
3. **Top fixes, ranked (3 to 5):** what to change, why, which files or
   pages, and effort (small, medium, large).
4. **Carried over:** fixes from earlier reports not yet done.
5. **Articles audited this month** (so the next run rotates to others).
