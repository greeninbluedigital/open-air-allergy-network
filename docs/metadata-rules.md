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
- Blog article: `Article.summaryPoints` (joined) or the stripped Markdown
  body — same idea, arbitrary length.

If you add a new page type with a dynamic description, run it through
`truncateForMeta()` rather than a manual `.slice()` — a raw slice can both
cut mid-word and doesn't enforce the 155 ceiling if the max changes later.

## Current state by page type

| Page type | Title | Description | Canonical | Robots |
|---|---|---|---|---|
| Home, SRP, Learn About ILIT, For Practices, About, Blog index | Static string + `\| Open Air Allergy Network` suffix | Static string, 70–155 chars | Self-referencing | Indexable |
| PDP (`/find-an-ilit-provider/[slug]`) | `{Practice Name} — ILIT Provider in {City}, {State}`, no suffix (`absolute`) | `shortBio` (or a generated fallback sentence) via `truncateForMeta()` | Self-referencing | Indexable, except `isDemo` listings (`noindex, nofollow`) |
| Blog article (`/blog/[slug]`) | Article's own title, no suffix (`absolute`) | `summaryPoints` (or stripped Markdown body) via `truncateForMeta()` | Self-referencing | Indexable |
| Learn About ILIT cluster page (`/learn-about-ilit/[slug]`) | Article's own title, no suffix (`absolute`) | Same as Blog article, via `truncateForMeta()` | Self-referencing | Indexable |
| SEM landing page (`/lp/[providerSlug]/[metroSlug]`) | `ILIT in {City} — {Metro}`, no suffix (`absolute`) | Not set | None (noindexed, moot) | Always `noindex, nofollow` |
| Legal pages (`/legal/[slug]`) | Page title + suffix | Not set | None (noindexed, moot) | `noindex, follow` |
| `/api/*` | n/a | n/a | n/a | `X-Robots-Tag: noindex, nofollow` (HTTP header, not meta) |

Everything above is currently moot for actual search visibility: `robots.ts`
blanket-disallows crawling site-wide while the site is being used as a
pseudo-dev environment on the Vercel URL (see the launch punch list memory).
These rules are what will actually take effect once that's lifted.

## H1 conventions

- PDP: practice name as the dominant line, with a smaller "ILIT Provider in
  {City}, {State}" subline inside the same `<h1>` — matches the `<title>`
  tag's wording so both signals reinforce the same phrase instead of
  splitting across two different ones.
- Blog article / Learn About ILIT cluster page: the article's own title,
  shared via `ArticleDetail.tsx`.
- Homepage: the hero headline (`"Allergy season shouldn't mean missing
  yours."`) is the `<h1>`.
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
