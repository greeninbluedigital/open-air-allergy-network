# Blog content guide

Notes for whoever is writing/publishing blog articles (currently: direct
database writes via Prisma Studio or a one-off script — articles are not
sheet-managed like Providers).

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

## Crediting a guest article to a practice

Set two fields (direct DB write, not sheet-synced):
- `Article.authorId` → an `Author` record's id (create one if this is a new
  contributor: `name`, `bio`, optionally reuse the provider's own photo as
  `Article.authorPhotoUrl` only if it's genuinely a photo of that specific
  person — confirm with the provider, don't assume for multi-doctor
  practices).
- `Article.providerCreditedId` → the credited `Provider`'s id.

This drives three things automatically: the "Contributed by" byline box on
the article page, the "contrib" (vs. "house") badge color on its tags, and
the PDP's "Articles From This Practice" module for that provider.
