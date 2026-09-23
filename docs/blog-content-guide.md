# Blog content guide

Notes for whoever is writing/publishing articles — both `/blog/[slug]` and
`/learn-about-ilit/[slug]` are the same underlying `Article` model, database-
authored (Prisma Studio or a one-off script), not sheet-managed like
Providers.

**Prose style is governed separately**, by `OpenAirAllergyNetwork_STYLE_GUIDE.md`
(repo root) and the `open-air-allergy-writing` Claude Code skill
(`.claude/skills/`) — read/apply that before drafting or editing any
article body or FAQ text. It fixes a specific "AI-smooth" pattern (recycled
hedge-closer phrasing, rule-of-three prose lists, FAQ answers that just
restate the body, no em dashes/hyphens/semicolons as clause joiners) found
in this site's own published content. This doc covers structure/data, that
one covers sentence-level writing.

## BLOG vs. LEARN sections

`Article.section` is `BLOG` or `LEARN`, and determines both the URL and how
the page behaves:

- **BLOG** (`/blog/[slug]`) — timely/news-style content: practice spotlights,
  industry news, guest contributions. "Published {date}" framing. Shows in
  the Blog index and its tag filters. Credit box (if any) reads "Contributed
  by" and is ungated — set once, shows immediately (see below).
- **LEARN** (`/learn-about-ilit/[slug]`) — the keyword-targeted comparison/
  education cluster pages from the 2026-09 SEO strategy (owning "ILIT" and
  intralymphatic immunotherapy search terms, while also capturing traffic
  searching the much higher-volume "allergy shots"/"allergy drops"/SCIT/SLIT
  terms). Evergreen — "Last reviewed {date}" framing instead of a publish
  date. Never appears in the Blog index/tag filters. Surfaced instead via the
  navigation module in `Learn About ILIT`'s "Comparing ILIT to Other Allergy
  Treatments" section (`src/app/(site)/learn-about-ilit/page.tsx`), which
  renders nothing until the first LEARN article exists and grows
  automatically after that. Promoting individual pages into the global nav's
  "Find a Provider"-style hover menu is a deliberately later decision, made
  once there's real traffic data (GA4) showing which pages are worth it —
  not part of building the page itself.

Both sections share the same rendering (`src/components/ArticleDetail.tsx`)
and the same Markdown/FAQ/Key-Takeaways/metadata machinery described below —
only the framing differs.

## Tags

`Article.tags` is a plain `String[]` — free text, no schema enum, no
normalized Tag table (deliberate, per the schema comment: "tags are
intentionally uncontrolled free text"). Nothing stops two articles from using
slightly different wording for the same idea ("Comparisons" vs "Comparison"),
so treat the list below as the fixed vocabulary rather than improvising new
tags per article.

**What tags are actually used for today:**
- The Blog index's tag filter pills + counts (`getTagCounts()` in `src/lib/blog.ts`).
- Curating thematic `ArticleFeed` pulls elsewhere on the site — e.g. Learn
  About ILIT's "Backed by Clinical Literature" section shows anything tagged
  `Clinical Research`.
- Displayed as badge chips at the top of each article page — decorative only
  today, not clickable from there.

**Canonical starting list** (add to this list deliberately, don't drift):

Content type — what kind of piece this is:
- `Clinical Research`
- `Comparisons`
- `Practice Spotlight`
- `Patient Guide`
- `Industry News`

Topic — what it's actually about:
- `ILIT`
- `SCIT`
- `SLIT`
- `Allergy Symptoms`

A typical article gets one content-type tag plus one topic tag (e.g. the
Avant Allergy comparison article is `["ILIT", "Comparisons"]`). Exact
spelling/casing matters since matching is a literal string compare
(`tags: { has: tag }`) — copy from this list rather than retyping it.

## Crediting a guest article to a practice (BLOG)

Practitioners (the `Author` record — name/title as it should appear in a
byline, bio, which provider(s) they're affiliated with) are managed on the
**"Practitioners"** sheet tab now, not Prisma Studio — see
`docs/sheet-columns.md`. Create the practitioner there first if they're new.

Then set two fields on the Article (still a direct DB write, not
sheet-synced):
- `Article.authorId` → that `Author` record's id. Optionally set
  `Article.authorPhotoUrl` too — only if it's genuinely a photo of that
  specific person; confirm with the provider, don't assume for multi-doctor
  practices.
- `Article.providerCreditedId` → the credited `Provider`'s id.

This drives three things automatically: the "Contributed by" byline box on
the article page, the "contrib" (vs. "house") badge color on its tags, and
the PDP's "Articles From This Practice" module for that provider. Unlike
LEARN's credit (below), this is ungated — it shows as soon as both fields
are set, no separate approval flag.

## Crediting a LEARN cluster page ("Medically reviewed by")

Different mechanism, and deliberately not a straight copy of the BLOG one:
this credit is a paid perk (rolled into the Featured provider package), so
it needs to reflect actual documented approval from the credited practice,
not just a nameplate — and needs to be pullable in one step if a Featured
subscription lapses.

Managed via the **"Learn Page Credits"** sheet tab (see
`docs/sheet-columns.md`), not a direct DB write: Page Slug, Provider Slug,
Practitioner Slug (optional — only needed if the provider has more than one
practitioner on the Practitioners tab), Approved (Y/N), Notes. Under the
hood this sets the same `authorId` / `providerCreditedId` fields as a BLOG
credit, plus `Article.reviewApproved` — the box only renders when that's
`true`. This means a credit can be staged (author + provider linked) before
there's documented sign-off, and turned off in one sync run — set `Approved`
to `N` or delete the row — without losing the underlying links if the same
practice gets re-approved later. See the schema comment on
`Article.reviewApproved` for the full reasoning.

Practical flow: get the practice's actual sign-off on the page content
first (even a quick approve/edit pass — the point is a real doctor actually
looked at it, not just a rotating nameplate), *then* add the row with
`Approved = Y`.
