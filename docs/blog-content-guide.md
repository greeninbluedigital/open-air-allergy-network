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
- Curating thematic `ArticleFeed` pulls elsewhere on the site (the `tag`
  prop). Nothing uses this right now: Learn About ILIT's old "Backed by
  Clinical Literature" section (which pulled `Clinical Research`) was
  replaced by "Recent Blog Articles from Our Providers" in 2026-09.
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

## Drafting and publishing

1. Draft in `content-drafts/<slug>.md`: a metadata comment block (Section,
   Title, URL, Meta description, Tags, Feature image, Image alt, KEY
   TAKEAWAYS, FAQS with `Q:`/`A:` lines, SOURCES), then the Markdown body
   after the `BODY` line. The owner edits (saving `v2`, `v3`…), Claude
   fact-checks the edits.
2. Publish the approved version:
   `npx tsx scripts/publish-article.ts "content-drafts/<file>.md"` (add
   `--dry-run` to check first). It checks the title (62 characters max) and
   description (70 to 155) and creates or updates the article and its FAQs.
3. Add it to the Published table in `docs/content-ideas.md`, and delete the
   draft files.

The feature image is 1600 × 900 (16:9) on Cloudinary, used for both the
article header and the blog card. "Image alt" describes the photo for screen
readers and image search, and falls back to the title if blank.

## Sourcing every article (owner's rule, 2026-09-30)

Treat this as journalistic integrity. Every number or medical fact in an
article (a schedule, a timeframe, a test detail) is attributed to a named,
reputable source in the text, with a link to that source. External links
open in a new tab automatically (`src/components/ArticleDetail.tsx`).

- **Name the source in the sentence** ("The AAAAI says…", "Cleveland Clinic
  describes…") and link the name. Prefer professional bodies (AAAAI, ACAAI),
  government health sites (MedlinePlus, NIH), major medical centers, and
  peer-reviewed studies.
- **When reputable sources differ, show both.** For example, AAAAI gives 4
  to 6 months of allergy-shot build-up and Cleveland Clinic gives 6 to 10.
  Showing the range tells readers that treatment regimens vary from practice
  to practice, which is true and more useful than picking one number.
- **The final decision is between the patient and their doctor.** Say so
  once, with a real reason attached (see the hedge-closer rules in
  `OpenAirAllergyNetwork_STYLE_GUIDE.md`), not as a reflex on every point.
- **Verify each claim against the source itself**, not a search summary. If
  a source can't be read or doesn't say it, cut the claim or soften it.
- Each draft in `content-drafts/` lists its sources and what each supports,
  so the reviewer can check them.

## Writing about clinical research (playbook)

Agreed with the site owner 2026-09-28. Applies to any article that
summarizes a published study (usually BLOG, tagged `Clinical Research` plus
a topic tag). The style guide still governs sentence-level writing; its
"Medical Sourcing and Claims" section applies in full. Drafts go through the
usual `content-drafts/` workflow (draft, owner edits, fact-check, publish,
delete the draft).

### Before writing

1. **Read the full paper, not just the abstract.** Abstracts present results
   in their best light; the results, limitations, and disclosures sections
   are where the honest detail is. Note the paper's license (PMC shows it
   near the top): CC BY allows reuse with attribution; anything else means
   keeping direct quotes short.
2. **Pick target keywords from what the study actually supports.** Favor
   specific phrases people search (for example "ILIT study results,"
   "intralymphatic immunotherapy clinical trial," plus the allergen or
   condition studied). If a keyword would need the study to say something it
   doesn't, drop the keyword, never bend the summary.
3. **Check what currently ranks for that keyword** (length, structure,
   tone) and match the searcher's intent.

### Summarizing faithfully

- **Quote sparingly.** One or two short direct quotes for the central
  conclusion, in quotation marks and attributed. Paraphrase the rest.
- **Copy numbers exactly as reported, with context:** how many people, what
  was measured, compared with what. Don't round in a way that changes
  meaning, and don't turn a relative change into an absolute one (or the
  reverse).
- **Don't strengthen the language.** "May reduce" stays "may reduce";
  "associated with" never becomes "causes"; nothing "proves" or "cures."
  Explain "statistically significant" in plain words; it doesn't mean
  "large."
- **Don't generalize beyond who was studied** (age group, allergen,
  severity, country).
- **Report every main result, good and bad,** including outcomes that
  showed no difference, and side effects or adverse events.
- **Include the authors' own stated limitations.**
- **Translate terms, not claims.** Define jargon (placebo-controlled,
  double-blind) once in plain words; keep what the authors concluded intact.
- **State the study design:** type (randomized controlled trial,
  observational study, review or meta-analysis), number of participants,
  duration, and who they were.
- **Note funding and author conflicts of interest** from the paper's
  disclosures. Example: the 2008 PNAS ILIT trial cited on Learn About ILIT
  was led by the researcher named as inventor on the ILIT patent.
- **One study isn't the final word.** Give the publication year and present
  it as one piece of the evidence, not a settled answer.
- **Regulatory context:** where relevant, note that ILIT isn't
  FDA-approved, using the same framing as Learn About ILIT's safety
  section.

### Structure and length

Fixed outline:

1. **Bottom line:** 2 to 3 plain sentences.
2. **What they studied.**
3. **What they found,** good and bad.
4. **Limitations,** as the authors stated them.
5. **What it does and doesn't mean for you.** One pointer to an allergist,
   with a specific reason (style guide: hedge-closers are capped).
6. **Source:** full citation and link (format below).
7. **Disclosure line** (below).

**Length: 600 to 1,000 words.** Reference: Semrush, "How Long Should a Blog
Post Be?" (Margarita Loktionova, 2022) puts news articles at 600 to 1,000
words and informational posts at 1,000 to 1,500, with 1,500 to 2,500 as a
general blog range. A study summary sits at the news end: readers want the
findings, honestly stated, not a guide. The same article stresses that
search intent and quality matter more than word count, so check what ranks
(step 3 above) and never pad.

**Headline:** says what was studied and found, in measured terms. No
"breakthrough," "cure," or "game-changer."

### Citation format

Link the study the first time it's mentioned in the body, then give the
full citation in the Source section:

> Authors (first three, then "et al."). "Title." *Journal*. Year;Volume(Issue):pages. doi:… PMID: … (linked)

Example (verified against PubMed):

> Senti G, Prinz Vavricka BM, Erdmann I, et al. "Intralymphatic allergen administration renders specific immunotherapy faster and safer: a randomized controlled trial." *Proc Natl Acad Sci U S A*. 2008;105(46):17908-12. doi:10.1073/pnas.0803725105. PMID: 19001265.

### Disclosure line

OAAN is a directory of ILIT providers, so it has a business reason to
present ILIT favorably. Every research summary ends with a short disclosure
(proposed wording, confirm with the site owner before first use):

> Open Air Allergy Network is a directory of ILIT providers. This summary is for general information and isn't medical advice.

### Fact-check before publishing

Every factual sentence must trace to a specific passage in the paper. The
draft file carries a fact-check table at the bottom (claim, then the paper
section or quote it comes from); it's checked before publishing and deleted
along with the draft.

### Research considered (log)

Every study reviewed for a summary article gets a row here, whether it was
published or not, so the same paper isn't re-researched later and the
reasoning stays on record. If a study is declined, it's declined outright:
the playbook's disclosure rules are never relaxed to make a paper
publishable.

**Status (2026-09-28): research summaries are paused.** After screening the
papers below, the owner found more red flags than material that would help
consumers consider ILIT, and prefers to let consumers do their own research
on clinical findings for now. Possible future direction: ask credited
providers which studies they'd want summarized in their own blog entries,
then run those through this playbook.

**Not yet screened** (primary trials cited by the Ramchandani review below,
noted as better candidates than reviews if summaries resume): Skaarup et
al. 2021, *J Allergy Clin Immunol*, 3-year randomized placebo-controlled
ILIT trial for grass pollen (Denmark); Hjalmarsson et al. 2023, *J Investig
Allergol Clin Immunol*, 5-year follow-up of a randomized placebo-controlled
trial for birch and grass allergy (Sweden); Hoang et al., ILIT
meta-analysis (483 participants).

| Date | Study | Decision | Reasons |
|---|---|---|---|
| 2026-09-28 | Jiang S, Xie S, Tang Q, et al. "Evaluation of Intralymphatic Immunotherapy in Allergic Rhinitis Patients: A Systematic Review and Meta-analysis." *Mediators of Inflammation*. 2023;2023:9377518. doi:10.1155/2023/9377518. PMID: 37197570. [PMC10185423](https://pmc.ncbi.nlm.nih.gov/articles/PMC10185423/) | Declined | **Data-quality red flags:** the quality-of-life result is printed with a confidence interval that can't match its p-value (minus signs missing, in both abstract and results); the authors' conclusion ("validated the safety and effectiveness") is stronger than their own stated limitations (substantial heterogeneity and risk of bias, selective-reporting risk unclear in 62% of trials); the booster-injection finding rests on a 2-trial subgroup; the nasal-score interval subgroup uses a scale direction the paper doesn't explain; the paper says ILIT was "favored" for injection-site swelling when swelling was more common with ILIT. Summarizing it honestly would mean explaining away the paper's own errors. **Funding disclosure:** funded by the National Natural Science Foundation of China and the Hunan Provincial Natural Science Foundation. The playbook requires disclosing funding, and the owner judged that disclosure could be a sensitive topic for some US readers. Mixed results otherwise (13 RCTs, 454 participants): symptom/medication scores and quality of life improved vs. placebo; nasal symptom scores and skin-prick tests showed no significant difference; local swelling/redness more common with ILIT, no severe adverse events reported. |
| 2026-09-28 | Ramchandani R, Lucyshyn R, Linton S, Ellis AK. "Breaking the mold: nontraditional approaches to allergen immunotherapy for environmental allergens." *Immunotherapy*. 2024;16(18-19):1153-1169. doi:10.1080/1750743X.2024.2408216. PMID: 39382452. [PMC11633400](https://pmc.ncbi.nlm.nih.gov/articles/PMC11633400/) | Declined | **Misreports its sources:** narrative review whose ILIT section cites the Jiang 2023 meta-analysis (declined above) inaccurately: gives Jiang's symptom-medication result as SMD -0.51 (95% CI -1.31 to 0.28) and calls it significant, when Jiang reported -0.85 (-1.58 to -0.11); says Jiang found the booster significantly improved nasal (VAS) scores, when Jiang's VAS booster subgroup showed no difference (p = 0.60); copies Jiang's misprinted quality-of-life interval; gives Jiang's n as 452 (Jiang: 454). **Secondary source:** a summary would be a summary of a summary, and ILIT is one short section of seven approaches. **Conflicts of interest (disclosed):** senior author AK Ellis lists advisory, speaker, grant, or consulting ties to more than a dozen companies, including ALK-Abelló and Stallergenes Greer (major SCIT/SLIT product makers), and was president of the Canadian Society of Allergy and Clinical Immunology at submission. No funding statement found. Otherwise measured on ILIT: "the efficacy and safety of ILIT are not yet fully established, and no ILIT products have been approved for use"; mostly local, mild side effects; fewer reactions than SCIT; little pediatric data. |

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
