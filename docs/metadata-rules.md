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
4. **Robots**: default indexable. `noindex` for anything that shouldn't rank
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
| Home (`/`) | `Find ILIT Allergy Treatment Near You \| Open Air Allergy Network`, written out in full (`absolute`). **63 characters: a deliberate owner-approved exception to the 62 budget** (2026-09-28); any truncation only trims the brand at the end. Also carries WebSite + Organization JSON-LD (site name for results; contact points to the About form, no email, to avoid scraping) | Root layout default | Self-referencing | Indexable |
| SRP, Learn About ILIT, For Practices, About, Blog index | Static string + `\| Open Air Allergy Network` suffix | Static string, 70–155 chars | Self-referencing | Indexable |
| PDP (`/find-an-ilit-provider/[slug]`) | `{Practice Name} — ILIT Provider in {City}, {State}`, no suffix (`absolute`). When the same Group ID has another active office in the same city and state, ` ({Street})` is appended (from the address, house number dropped), and the H1 subline and Freemium summary carry the street too, so sibling pages don't share a title and description. Demo listings never get it | Verified+: `shortBio` (or a generated fallback sentence) via `truncateForMeta()`. Freemium: never `shortBio` (it isn't displayed), always the page's own summary sentence ("{Practice} in {City}, {State} is confirmed to offer ILIT…", or "is listed as…" before the Verification Date is set) plus "Listed on Open Air Allergy Network." Share image (`og:image`) only for Full Profile+, the tiers that show the photo | Self-referencing | Indexable, except `isDemo` listings (`noindex, nofollow`) |
| Blog article (`/blog/[slug]`) | Article's own title, no suffix (`absolute`) | `metaDescription`, else `summaryPoints` (or stripped Markdown body) via `truncateForMeta()` | Self-referencing | Indexable |
| Learn About ILIT cluster page (`/learn-about-ilit/[slug]`) | Article's own title, no suffix (`absolute`) | Same as Blog article, via `truncateForMeta()` | Self-referencing | Indexable |
| SEM landing page (`/lp/[providerSlug]/[metroSlug]`) | `ILIT in {City} — {Metro}`, no suffix (`absolute`) | Not set | None (noindexed, moot) | Always `noindex, nofollow` |
| Legal pages (`/legal/[slug]`) | Page title + suffix | Not set | None (noindexed, moot) | `noindex, follow` |
| `/api/*` | n/a | n/a | n/a | `X-Robots-Tag: noindex, nofollow` (HTTP header, not meta) |
| Scraper trap (`/find-an-ilit-provider/quillmoor-allergy-sinus-center-wichita`) | Mirrors a PDP title (`absolute`) | Not set | None | `noindex, nofollow`, and disallowed in `robots.ts` (keep that disallow). Never in the sitemap. See `docs/anti-scraping.md` |

Since launch (2026-10-02), `robots.ts` allows crawling of everything except
the scraper trap, so these rules are live. The canonical host is
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

- PDP: practice name as the dominant line, with a smaller "ILIT Provider in
  {City}, {State}" subline inside the same `<h1>` — matches the `<title>`
  tag's wording so both signals reinforce the same phrase instead of
  splitting across two different ones.
- Blog article / Learn About ILIT cluster page: the article's own title,
  shared via `ArticleDetail.tsx`.
- Homepage: the hero headline (`"Allergy treatment in months, not
  years."`) is the `<h1>`.
- SRP: no visible headline fits the compact search-bar header without a
  redesign — uses a `sr-only` `<h1>` ("Find an ILIT Provider Near You") so
  there's still a real H1 in the DOM without changing the visual design.
- Everywhere else: a plain, visible `<h1>` matching the page's purpose
  (e.g. "Learn About ILIT", the article's own headline).

## Last audited

2026-09-18 — every active/non-demo provider and every published article
checked against rules 1–2 above; all in bounds after the `absolute` title
fix and `truncateForMeta()` rollout. Re-check whenever provider or article
volume grows meaningfully, since these are per-record and a new practice
name/city combination or a new headline could exceed budget even though the
current set doesn't.
