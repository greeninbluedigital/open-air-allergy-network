# Metadata rules

The rules this site follows for `<title>`, meta description, canonical, and
robots on every page. Keep this in sync whenever a rule changes or a new
page type is added — it's the source of truth, not the code comments
scattered across each `generateMetadata`.

## The rules

1. **Title: 62 characters max**, as actually rendered in the browser tab
   (i.e. including any site-name suffix). Google allows up to ~65; this
   stays a little under to be safe.
2. **Meta description: 70–155 characters.** Below 70 looks thin; above 155
   risks mid-sentence truncation in search results.
3. **Self-referencing canonical** on every indexable page. Not added to
   noindexed pages (legal, SEM landing pages) — moot since they're excluded
   from the index regardless.
4. **Robots**: default indexable, set explicitly in the root layout as `index, follow, max-image-preview:large` (2026-10-26; the large image preview lets Google show our images at full size in results and Discover). A page that sets its own `robots` replaces the whole default. 404 pages carry both Next's automatic `noindex` and the default; harmless, since the 404 status keeps them out of the index. `noindex` for anything that shouldn't rank
   on its own (legal boilerplate, demo/sales listings, SEM paid-traffic
   pages). `X-Robots-Tag` HTTP header (not a meta tag) for non-HTML routes
   like `/api/*`, since `<meta name="robots">` only applies to HTML
   documents.

## Why titles use `title: { absolute: ... }` on some pages

The root layout (`src/app/layout.tsx`) sets a title template:
`"%s | Open Air Allergy Network"`. That suffix is 28 characters — for a
static page title like "Learn About ILIT" (17 chars) there's plenty of room
left in the 62-char budget. But for pages with real dynamic content (a
practice name + city + state, or a full article headline), the suffix alone
can eat the entire budget before the page's own content is even counted.

So the rule in practice:
- **Static/marketing pages** (Home, SRP, Learn About ILIT, For Practices,
  About, Blog index, Legal) keep the template suffix — brand reinforcement
  matters more there, and none of them are near the character limit.
- **Dynamic detail pages** (PDP, Blog article, Learn About ILIT cluster page,
  SEM landing page) set `title: { absolute: "..." }` in `generateMetadata`,
  which skips the parent template entirely. Verified against every live
  provider and article 2026-09: without this, every single one of them
  exceeded 62 characters, including a real article title the user had
  deliberately chosen — the fix was dropping the suffix, not shortening
  their content.

## Why descriptions go through `truncateForMeta()`

`src/lib/metadata.ts`'s `truncateForMeta(text, max = 155)` trims arbitrary
source copy down to a valid meta description: cuts at the last sentence
boundary within budget if one exists past the halfway point, otherwise the
last word boundary plus an ellipsis. Never a raw mid-word cut.

This matters because the "natural" source text for a description is often
written for a different purpose and length:
- PDP: `Provider.shortBio` is long-form "About This Practice"-length copy
  (one real provider's was 515 characters) — used as source text, not
  rendered directly.
- Blog article: `Article.metaDescription` when set (hand-written, 70 to 155
  characters, added 2026-09-30); otherwise `Article.summaryPoints` (joined)
  or the stripped Markdown body, which can be any length.

If you add a new page type with a dynamic description, run it through
`truncateForMeta()` rather than a manual `.slice()` — a raw slice can both
cut mid-word and doesn't enforce the 155 ceiling if the max changes later.

## Current state by page type

| Page type | Title | Description | Canonical | Robots |
|---|---|---|---|---|
| Home (`/`) | `ILIT Allergy Treatment Near You: Faster Than Allergy Shots` (58 characters, `absolute`, owner-approved 2026-10-26; was `Find ILIT Allergy Treatment Near You \| Open Air Allergy Network`). No brand: Google shows the site name separately from the WebSite JSON-LD, so the title leads with "ILIT allergy treatment" (the phrase to own) and names allergy shots for people who don't know ILIT yet. Also carries WebSite + Organization JSON-LD (site name for results; contact points to the About form, no email, to avoid scraping) | Own (2026-10-26, 143 characters): "Allergy shots take 3 to 5 years. ILIT (intralymphatic immunotherapy) is typically 3 injections over 2 months. Find a provider and read reviews." "Read reviews" holds while most active practices show reviews (47 of 57 on 2026-10-26, mostly trials ending 2027-06-01); revisit if that drops. The root layout default description now only serves pages without their own | Self-referencing | Indexable |
| SRP, For Practices, About | Static string + `\| Open Air Allergy Network` suffix (For Practices: "List Your ILIT Allergy Practice", 2026-10-27, no "join the network" framing) | Static string, 70–155 chars. About uses the Organization definition: "Open Air Allergy Network: a national directory of allergists verified to offer ILIT (intralymphatic immunotherapy), a faster alternative to allergy shots." | Self-referencing | Indexable |
| Learn About ILIT (`/learn-about-ilit`) | `What Is ILIT Allergy Treatment? Intralymphatic Immunotherapy` (`absolute`, 60 characters, 2026-10-27); H1 "Learn About ILIT (Intralymphatic Immunotherapy) Allergy Treatment"; FAQ H2 "Frequently Asked Questions About ILIT and Allergies" | "What is ILIT? Intralymphatic immunotherapy is an allergy treatment that typically takes 3 injections over 2 months instead of years of allergy shots." | Self-referencing | Indexable |
| Blog index (`/blog`) | `Allergy Blog: Symptoms, Triggers and Treatment Options` (`absolute`, 54 characters, 2026-10-27), also the H1. A tag view (`/blog?tag=…`) uses "{Tag} Articles" (or the guide tag's name) for both, with the site suffix | Static string; tag views "Allergy articles tagged …" | Self-referencing (tag views keep `?tag=`) | Indexable |
| PDP (`/find-an-ilit-provider/[slug]`) | `{Practice Name} \| ILIT Provider in {City}, {State}` ("ILIT Allergy Provider" when the practice name has no "allergy" in it, 2026-10-25; the H1 subline matches) (pipe since 2026-10-18; was an em dash, which reads as AI-written, and a hyphen would double up with names like "Aspire Allergy & Sinus - Victoria"), no suffix (`absolute`). When the same Group ID has another active office with the same practice name in the same city and state, ` ({Street})` is appended (from the address, house number dropped), and the H1 subline and Freemium summary carry the street too, so sibling pages don't share a title and description. Demo listings never get it | Verified+: `shortBio` (or a generated fallback sentence) via `truncateForMeta()`. When the page shows reviews (`reviewsWouldShow`), " Read patient reviews." is added if it fits after the trimmed text, or when the text is cut mid-sentence anyway; it's skipped when it would cut a complete sentence (2026-10-27; 27 of 45 review pages had it at launch). Freemium: never `shortBio` (it isn't displayed), always the page's own summary sentence ("{Practice} in {City}, {State} is confirmed to offer ILIT…", or "is listed as…" before the Verification Date is set) plus "Listed on Open Air Allergy Network." Share image (`og:image`) only for Full Profile+, the tiers that show the photo | Self-referencing | Indexable, except `isDemo` listings (`noindex, nofollow`) |
| Providers by State (`/find-an-ilit-provider/by-state`) | `ILIT Allergy Providers by State` with the site suffix (2026-10-26; H1 matches, and each state's H2 is "ILIT allergy providers in {State}") | Fixed: "Browse ILIT (intralymphatic immunotherapy) providers by state and metro area across the U.S., …" | Self-referencing | Indexable, in the sitemap, linked from the footer. BreadcrumbList JSON-LD |
| State page (`/find-an-ilit-provider/{state}`, e.g. `texas`) | `ILIT Allergy Treatment Providers in {State}`, matching the H1, no suffix (`absolute`, 2026-10-26; longest is North Carolina at 50). Metro H2s read "{Metro} area allergists" ("San Francisco Bay Area allergists" when the name already ends in Area) | Generated, mirroring Find a Provider: "Find allergists who offer ILIT allergy treatment in {State}, including {metros}. Every practice is verified before it's listed.", naming as many metros (up to 4) as fit in 155 characters, none if even one doesn't fit. No practice counts anywhere on these pages (owner, 2026-10-13) | Self-referencing | Indexable. Only states with an active practice exist (others 404); all of them are in the sitemap. BreadcrumbList and ItemList JSON-LD |
| Blog article (`/blog/[slug]`) | Article's own title, no suffix (`absolute`) | `metaDescription`, else `summaryPoints` (or stripped Markdown body) via `truncateForMeta()` | Self-referencing | Indexable |
| Learn About ILIT cluster page (`/learn-about-ilit/[slug]`) | Article's own title, no suffix (`absolute`) | Same as Blog article, via `truncateForMeta()` | Self-referencing | Indexable |
| SEM landing page (`/lp/[providerSlug]/[metroSlug]`) | `ILIT in {City} — {Metro}`, no suffix (`absolute`) | Not set | None (noindexed, moot) | Always `noindex, nofollow` |
| Legal pages (`/legal/[slug]`) | Page title + suffix | Not set | None (noindexed, moot) | `noindex, follow` |
| `/api/*` | n/a | n/a | n/a | `X-Robots-Tag: noindex, nofollow` (HTTP header, not meta) |
| Scraper trap (`/find-an-ilit-provider/quillmoor-allergy-sinus-center-wichita`) | Mirrors a PDP title (`absolute`) | Not set | None | `noindex, nofollow`, and disallowed in `robots.ts` (keep that disallow). Never in the sitemap. See `docs/anti-scraping.md` |

Since launch (2026-10-02), `robots.ts` allows crawling of everything except
the scraper trap and, since 2026-10-15, Next.js page data URLs (`/*?_rsc=`
and `/*&_rsc=`). Google's Crawl stats showed about 65% of Googlebot's
requests going to those prefetch files, which never get indexed, and only 8%
to HTML pages. So these rules are live. The canonical host is
`https://openairallergynetwork.com` (no www): `www` and the old
`open-air-allergy-network.vercel.app` address both redirect there (Vercel
Domains for www, `next.config.ts` for vercel.app, which leaves `/api/*` alone
for the cron jobs).

## Sitemap dates and IndexNow

- **Practice pages:** `lastmod` is `Provider.contentUpdatedAt`, which only
  moves when something a visitor sees changes (fields, treatments, FAQs).
  The daily sync rewrites every row and "Verified as of" moves daily by
  design, so neither is used: Google ignores `lastmod` on sites where it
  changes without real changes. The visible "Verified as of" date is a
  patient trust signal and stays daily.
- **Articles:** Learn pages use `lastUpdated`, Blog posts their publish date.
- **IndexNow** (Bing, Yandex and others, not Google): the sync reports
  practice pages whose content changed, and `scripts/publish-article.ts`
  reports the article it publishes (`src/lib/indexNow.ts`, key file in
  `public/`). For Google, use Search Console's Request Indexing
  ([onboarding-checklist.md](onboarding-checklist.md)).

## H1 conventions

Practice page section headings are H2s (2026-10-27): "About {Practice}", "Getting Here", "Patient Reviews for {Practice}", "FAQs About ILIT Allergy Treatment at {Practice}", "Other Locations", "Contact {Practice}".

Practice page structured data never includes `AggregateRating` (removed 2026-10-27): Google's review snippet guidelines don't allow marking up ratings aggregated from other sites, and ours come from Google and Yelp. The visible reviews are fine. Star ratings in search results would need OAAN's own first-party reviews.

- PDP (all tiers, Freemium since 2026-10-27): practice name as the dominant line, with a smaller "ILIT Provider in
  {City}, {State}" subline inside the same `<h1>` — matches the `<title>`
  tag's wording so both signals reinforce the same phrase instead of
  splitting across two different ones.
- Blog article / Learn About ILIT cluster page: the article's own title,
  shared via `ArticleDetail.tsx`.
- Homepage: the hero headline (`"Most allergy treatment takes years.
  Yours could take months."`) plus a smaller keyword line under it ("Find
  an ILIT allergy treatment provider near you."), both inside one `<h1>`
  (2026-10-26), the same pattern as practice pages. The H2s carry search
  words too ("How to Find an ILIT Provider for Faster Allergy Treatment",
  "Do These Allergy Symptoms Sound Familiar?").
- SRP: a visible `<h1>` "Find an ILIT Allergy Treatment Provider Near You"
  with a one-line "enter your zip code" instruction above the search bar,
  on every view (2026-10-25; was `sr-only`). Before a search (no zip), a
  short description says what the directory is. Title "Find an
  ILIT Allergy Provider" + suffix. Returning visitors with a saved zip
  cookie are redirected to their results by `src/proxy.ts`, so they don't
  see that intro; Google and first-time visitors do.
- Everywhere else: a plain, visible `<h1>` matching the page's purpose
  (e.g. "Learn About ILIT", the article's own headline).

## Last audited

2026-09-18 — every active/non-demo provider and every published article
checked against rules 1–2 above; all in bounds after the `absolute` title
fix and `truncateForMeta()` rollout. Re-check whenever provider or article
volume grows meaningfully, since these are per-record and a new practice
name/city combination or a new headline could exceed budget even though the
current set doesn't.

## "ILIT" needs allergy context (2026-10-25)

Google often reads "ILIT" alone as an irrevocable life insurance trust. In
titles, H1s, meta descriptions and FAQ questions, pair "ILIT" with "allergy"
or "allergy treatment", or include "intralymphatic immunotherapy" nearby.
Applied 2026-10-25 across templates: practice page titles and H1 sublines
("ILIT Allergy Provider" when the practice name lacks "allergy"), state page
H1s ("ILIT Allergy Treatment Providers in {State}"; titles keep the brand
suffix, which already says "Allergy"), Learn page FAQ questions, the "What
is ILIT (Intralymphatic Immunotherapy)?" headings, For Practices, About and
Find a Provider, plus 36 practice FAQ questions in the sync sheet. Providers
by State was left as is (ranks #2). Some article subheadings still use
"ILIT" alone (lower priority; the articles define it).
