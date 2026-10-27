# Content pipeline: daily article drafting

The brief for the scheduled drafting run (and for any fresh Claude session
asked to "draft the next article"). Each run starts with no memory of past
conversations, so everything it needs is here or linked from here.

**Goal:** steady, high quality articles that win Google organic traffic for
Open Air Allergy Network (OAAN), a free, independent directory of allergists
who offer ILIT (intralymphatic immunotherapy). Articles bring readers in on
broad allergy questions and city or allergen searches, then lead them to
"faster options than years of allergy shots" and Find a Provider.

**Pace:** one draft per weekday run. The owner reviews every draft, and
publishes 3 to 5 a week. Quality over volume: Google penalizes mass produced
content, and health content is held to a higher bar (expertise, accuracy,
sources), so a careless article hurts the whole site.

## What a run may and may not do

**Do:**
1. Read `content-drafts/articles/QUEUE.md` and take the first item marked
   `next`. If the top item is past its "publish by" date, take it anyway and
   say so in the summary.
2. Research it, write the draft, save it as
   `content-drafts/articles/<slug>.md` in the format below.
3. In QUEUE.md, change that item's status from `next` to `drafted
   YYYY-MM-DD` and fill in its file name. Change nothing else in the queue.
4. Finish with a short summary (see "End of run summary").

**Never:**
- Publish anything, or run `scripts/publish-article.ts` (the owner reviews
  first, then the main session publishes).
- Run git commands, edit code, edit any file outside `content-drafts/articles/`,
  touch the database, the Google Sheet or any account.
- Draft an item marked `needs code` (interactive pieces get built in the main
  session) or anything about ILIT for children (only as a practice
  contributed article, see `docs/content-ideas.md`).
- Write research summary articles (paused since 2026-09-28).
- Draft more than one article per run.

## Read before writing (every run)

1. `OpenAirAllergyNetwork_STYLE_GUIDE.md` (repo root): voice, banned words,
   punctuation, formatting. It wins over anything here if they conflict.
2. `docs/blog-content-guide.md`: research and citation rules.
3. `docs/content-ideas.md`: the topic's row and detail sections (angle,
   keywords and any keyword data, timing, shared sources such as the NC
   State pollen article and Anderegg et al. 2021). Also its "Published" table, so you don't repeat
   an existing article and you know what to link to.
4. `docs/metadata-rules.md`: title and meta description limits.
5. One published draft for format reference, e.g.
   `content-drafts/articles/published/allergies-or-a-cold.md`. Every
   published article's draft is in that folder, which also helps with the
   repeated FAQ check. Read those files, never edit or move them.

## Section: always Blog (owner, 2026-10-20)

Every new article publishes to the Blog (`/blog/<slug>`): write
`Section: BLOG`. The Learn About ILIT page doesn't take new articles as a
section anymore. Instead, its "More Allergy Treatment Guides" area shows
articles tagged **Allergy Treatment Guides** (from either section), and that
tag's Blog filter lists every guide. Add the tag to a draft's Tags line only
when the queue row's title says "(Learn page: Yes)", which only the owner sets
(big evergreen guides to a specific allergy, never regional or city
articles). The older Learn articles keep their `/learn-about-ilit/` URLs.
Two city pages were first published to Learn by mistake (Austin, moved with
a redirect; Dallas–Fort Worth, moved the same day).

## Writing rules (summary, the style guide has the detail)

- **Lead with the answer.** The first paragraph answers the title's question
  plainly. Journalism style, most important first, no warm up.
- **Human, plain voice.** No em dashes, no hyphens or semicolons joining
  clauses. Vary sentence length. No banned words (delve, landscape, robust,
  leverage, unlock, elevate, navigate, tapestry, "it's important to note").
  No "Moreover", "Furthermore", "Additionally", "In conclusion". No tidy
  summary paragraph at the end. Contractions are fine.
- **Cite every fact** to a named source, linked inline: AAFA, ACAAI, AAAAI
  and its National Allergy Bureau, CDC, NIH and MedlinePlus, FDA, USDA,
  university extension services, peer reviewed studies (PubMed, PMC). Where
  sources differ, follow "Practical first" below. Paraphrase. Never copy another site's wording
  or structure. Direct quotes stay under 15 words and are rare.
- **Check every fact against the source page itself**, fetched during the
  run. Don't rely on memory for numbers, dates, months or study results.
- **Never diagnose.** The decision is between the reader and their doctor
  or allergist. Say so where it matters.
- **Emergency symptoms first.** If the topic overlaps an emergency (chest
  tightness, trouble breathing, throat or tongue swelling, anaphylaxis),
  open with a short "When to get care right away" section before anything else.
- **Where ILIT goes, in plain words (owner, 2026-10-20):** "a lymph node in
  the groin (just below the waist, near the hip)" or "at the top of the
  thigh, near the hip". Never "groin" alone, which some readers take to mean
  the genitals. Some practices use a neck lymph node instead (e.g. Columbia
  Allergy's A-ILIT).
- **ILIT claims match the Learn page** (`/learn-about-ilit`): about three
  injections over about two months; FDA approved extracts given by an off
  label route; research is promising but smaller than for allergy shots. No
  cure claims, no guaranteed results, no "best" or "only". Hedge benefits
  ("may", "in studies").
- **No prices, insurance or payment details** for any practice. General
  education about cost is allowed only in an article planned for it.
- **No practice lists or endorsements.** Never list or name the ILIT
  practices in an area, even on city pages: listings change, and an article
  would go stale (owner's rule, 2026-10-13). Send readers to Find a Provider
  with a zip filled in (`/find-an-ilit-provider?zip=<zip>`, e.g. a central
  zip for the city), and to the state page (`/find-an-ilit-provider/texas`,
  `/find-an-ilit-provider/north-carolina` and so on). A study
  author's affiliation may be named as part of citing the research. Never
  link to practice websites.
- **Lead generation comes first (owner, 2026-10-14).** Never tell readers to
  wait or to time immunotherapy around a pollen season. Nudge them to talk
  with an allergist now. Factual label or study timing (e.g. a tablet's
  start window) is fine as a fact, not as advice to wait. The treatment FAQ
  ends with: "use [Find a Provider](/find-an-ilit-provider) on
  OpenAirAllergyNetwork.com to locate an allergist who offers it." Naming
  the site in the text keeps the attribution when an AI summary drops the link.
- **End with "Longer term options"** (or similar): allergy medicine,
  allergy shots, allergy drops or tablets, and ILIT as the shorter course,
  then a link to the Learn comparison article and Find a Provider.
- **Keywords naturally:** the topic's target keywords in the title, first
  paragraph, one or two headings and the FAQs, plus "fast allergy
  treatment" or "faster alternative to allergy shots" once where it fits.
  Never stuff.
- **Length:** Blog 900 to 1,400 words, Learn guides 1,400 to 2,200, city
  pages 1,200 to 1,800. Long enough to fully answer, no padding.

## Internal links (use the ones that fit)

- `/learn-about-ilit` (main Learn page; FAQs at `#faq`, safety `#faq-safety`,
  candidates `#faq-candidate`, HSA/FSA `#faq-hsa-fsa`)
- `/learn-about-ilit/allergy-shots-vs-allergy-drops-vs-ilit`
- `/learn-about-ilit/allergy-shots-and-allergy-immunotherapy`
- `/learn-about-ilit/pet-cat-dog-allergy-treatment`
- `/learn-about-ilit/seasonal-allergies-by-season`
- `/blog/how-often-do-you-get-allergy-shots`
- `/blog/ilit-vs-traditional-allergy-shots`
- `/blog/allergy-skin-test-vs-blood-test`
- `/find-an-ilit-provider` and `/find-an-ilit-provider?zip=<zip>` for a city
- State pages, `/find-an-ilit-provider/<state name, lowercase, hyphens>`, e.g.
  `/find-an-ilit-provider/texas`, listing every practice in the state by metro
  area (only states with practices exist; check the page loads before linking)
- Any article in content-ideas' "Published" table added since this list

**Related guide card (owner, 2026-10-27):** when an article cross-promotes
another of our articles (usually the main guide on the same subject, e.g.
the dust mite allergy guide from "What Do Dust Mites Look Like?"), feature
it with a card, not only a text link: a link titled `card` on its own line,
`[Dust mite allergy guide](/blog/dust-mite-allergy "card")`. It shows that
article's thumbnail, title and description. Put it right after the intro,
one card per article (two at most), and only for a published article.
Ordinary in-text links stay as they are. Format: docs/image-guide.md.

## Keywords and focus (owner, 2026-10-27)

Added after the dust mite draft, which aimed at a narrow phrase, missed the
topic's two biggest searches ("dust mites", "dust mite bites") and spent
three FAQs on household pests.

1. **Plan the keywords before writing.** Find the topic's head term (the
   shortest, broadest search, e.g. "dust mites") and its biggest variants:
   check autocomplete for the head term on its own and with common
   follow-ons (bites, pictures, symptoms, treatment, vs.), and use any
   keyword data the owner put in content-ideas or the queue row (often a
   Mangools list with monthly searches and difficulty). Put the head term
   in the title, the first paragraph and at least one H2. The largest
   question search gets its own H2.
2. **One page per keyword.** Read the Target keywords line of every
   published draft on the same subject (`content-drafts/articles/published/`).
   Don't target a keyword another article already targets. In REVIEW NOTES,
   say which nearby keywords belong to which existing article, and suggest
   an addition to that article instead of competing with it.
3. **Stay on the allergy angle.** Every section and FAQ has to help someone
   with an allergy question: is it an allergy, what's triggering it, or how
   to treat it. Side topics (pests, home repair, products) can get a short
   mention in the body where readers need it, never a FAQ, even when
   autocomplete confirms the question. Test each FAQ: would its answer help
   a reader decide about their allergy or its treatment? If not, cut it.
4. **Product searches** ("dust mite spray", "mattress cover") are for
   shoppers. Don't chase them in an allergy article. Note them in REVIEW
   NOTES as a possible "do they work?" article instead.

## Draft file format

Save as `content-drafts/articles/<slug>.md`. Everything above `BODY` is
metadata the publish script reads, so keep the labels exactly:

```
<!--
DRAFT FOR REVIEW. Everything above the "BODY" line is page metadata, not
article text. Source links in the body open in a new tab.

Section: BLOG            (always BLOG; see "Section: always Blog" below)
Title (NN chars): ...    (max 62 characters)
URL: /blog/<slug>        (or /learn-about-ilit/<slug>)
Meta description (NN chars): ...   (70 to 155 characters)
Target keywords: "...", "..."
Tags: ...                (comma separated, from the tags already in use: Allergy Symptoms, Allergens, Allergy Testing, Comparisons, ILIT, SCIT, SLIT; propose a new tag only in REVIEW NOTES)
Feature image: TBD (owner uploads)   (or the URL from the queue row's Hero image column, if filled)
Image idea: one sentence describing a realistic, saturated, real setting photo (no faces, no clinic interiors)
(Photos inside the body are optional. They wrap beside the text and are portrait, 1200 × 1500: `![alt](URL "Caption")` on its own line, see docs/image-guide.md.)
Image alt: ...
Credit: none (house article).

KEY TAKEAWAYS
- 4 or 5 short, interesting one-line takeaways. No source tags in parentheses (owner, 2026-10-23): every takeaway must be stated and sourced in the body, so the box stays clean

FAQS
Q: ...
A: ... (6 to 9 FAQs, each a question people actually search and each on the allergy angle (see "Keywords and focus"): season, symptoms, the allergen's other names, related allergies, treatment timing. Each answer stands alone in 2 or 3 sentences with a linked source, and may restate a body fact in direct answer form. Never repeat another FAQ on this page or a question already used on another published article. **Check every question against Google autocomplete** with WebFetch on `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=<question words>`, try a few phrasings, and use the wording people actually type. Watch what the suggestions mean, e.g. "cedar fever drops" turned out to be store bought homeopathic products. Note in REVIEW NOTES which FAQs autocomplete confirmed; an unconfirmed FAQ can stay if it's useful)

SOURCES (all linked in the article)
- Source name, page title: the specific facts used from it
- Note any figure that's your own arithmetic

REVIEW NOTES
- Anything the owner should check or decide: shaky facts, a source that
  disagreed, a claim you left out on purpose, keyword volume unverified

BODY
-->

(Markdown article body: ## headings, short paragraphs, inline links)
```

## Practical first (owner, 2026-10-19)

Learned from the dust mite article, which took three rounds of review
because it read like a literature review. Readers come for what to do, not
for a debate between sources.

- **Ranges are fine, debates aren't.** Two sources giving different numbers
  for the same thing (4 to 6 months vs. 6 to 10) can still be shown as a
  range, which tells readers regimens vary (`docs/blog-content-guide.md`).
- **One clear recommendation per point.** When sources disagree about what
  to do, give the advice from the most current major health source (Mayo Clinic, Cleveland
  Clinic, AAFA, ACAAI, AAAAI, CDC, MedlinePlus) and stop. Don't stage the
  disagreement in the body. Mention it only when it changes what the reader
  should do, and then resolve it in the same breath with a fallback ("If
  your hot water doesn't reach 130°F, run the bedding through a hot dryer
  first"). Log the disagreement in REVIEW NOTES so the owner sees it.
- **Current sources lead.** Prefer pages and studies from the last five
  years. An older study or review (e.g. a Cochrane review whose search ended
  in 2009, a 1992 lab study) is used only when nothing newer covers the
  point, never to argue against current guidance, and its age is flagged in
  REVIEW NOTES. Guidelines still in force (a 2013 practice parameter) are
  fine for points current sources agree with.
- **No sentence undercuts the one before it.** "No trial has shown it helps.
  It's a reasonable fix." confuses readers. Either say what to do and why,
  or cut the point.
- **Answer the reader's next question.** For every instruction, ask whether
  a normal household can actually do it, and give the fallback if not (water
  heater not hot enough, no central air, renting). For every unfamiliar
  thing, say what it is in plain words (a dust mite is an arachnid, not an
  insect). For every product type, name it the way people search: plain
  name, technical name and brand, e.g. "the dust mite allergy tablet
  (sublingual immunotherapy, or SLIT), sold as ODACTRA".
- **How-to sections are numbered steps.** Each step starts with a bold
  action ("Cover the mattress and pillows.") followed by one or two
  sentences of why or how. Key Takeaways are actions or facts a reader can
  use, not summaries of research.
- **Research belongs in the treatment section,** told plainly once: what
  was studied, in whom, what happened. Home advice and symptoms come from
  current health organization pages, not individual studies.
- **Cover the basic searches in the FAQs first.** Before niche questions,
  check autocomplete for "[topic] symptoms", "can [topic] cause ...",
  "does [common fix] work" and "how to get rid of [topic]", and include the
  ones people type. Side topics (e.g. shellfish cross reactions in a dust
  mite article) go last or get cut.

## "ILIT" is ambiguous in search (owner, 2026-10-25)

Google often reads "ILIT" as an irrevocable life insurance trust. Never use
"ILIT" alone in a title, H1, meta description or FAQ question: pair it with
"allergy" or "allergy treatment", or spell out "intralymphatic
immunotherapy" nearby (e.g. "How do I find an ILIT allergy treatment
provider near me?").

## Ranking and how-to articles (owner, 2026-10-24)

An SEO advisor recommended ranking ("top 5") and how-to articles: AI
answer engines and Google quote them readily because each one is a clean,
structured answer. Many are localized to cities where OAAN lists ILIT
practices. The queue says which format an item uses.

**Ranking articles**
- **Title:** a number and, when local, the place: "5 Biggest Allergy
  Triggers in Tampa Bay". 62 characters or fewer, as always.
- **"How we ranked" comes first,** right after the opening answer: one or
  two sentences naming the data source and the measure (e.g. "Ranked by the
  Asthma and Allergy Foundation of America's 2026 Allergy Capitals report,
  which scores the 100 largest metro areas on pollen, allergy medicine use
  and access to allergists"). Read the source's own legend or method before
  describing it, and describe it in its words.
- **Never invent an order.** Rank only when a source gives the order or a
  measurable value to sort by (a rank, a count, a score). If no source ranks
  the items, the article is a list, and the title says so ("5 Allergy
  Triggers to Know in ..."), never "biggest", "worst" or "top".
- **Summary table** right after "How we ranked": rank, item, season or
  value, one line on why it matters. It's what gets quoted.
- **One `##` section per item, numbered in the heading** ("1. Oak pollen"):
  what it is, when it peaks locally, and one practical tip, each sourced.
- Ties and missing data are said plainly ("Huntington isn't among the 100
  metros AAFA ranks").

**How-to articles**
- **Title:** "How to [task]", plus the place when local: "How to
  Allergy-Proof Your Home in Humid Tampa Bay".
- **Opening answer** in two or three sentences: what to do and what it
  achieves. Then **What you'll need** (a short list) and, if a source gives
  it, how long it takes.
- **Numbered steps, one `##` or bold-led step each,** starting with the
  action ("Keep indoor humidity below 50%."), then one or two sourced
  sentences of why and how, with a fallback when a normal household can't do
  it (renting, no central air).
- **Local version:** a "[City] tip" section, or local steps woven in, built
  on real local data (humidity, the local pollen calendar, the AAFA rank). A
  local how-to links the national how-to hub when that exists.

**Localization rules (both formats)**
- **Genuinely local or not at all.** Google penalizes near-identical city
  pages. Write a local version only when the local data changes the advice
  or the list (humid Gulf coast vs. Midwest ragweed vs. Texas cedar). Never
  swap a city name into another article's text. Group nearby cities that
  share a season into one article instead of writing one per city.
- **National authority, not a local network (owner, 2026-10-24).** OAAN
  positions itself as the leading authority on ILIT in the U.S. Articles
  never say or imply which cities, states or regions OAAN covers: no "cities
  we serve", "ILIT cities", "our local practices", "where OAAN lists
  providers", and no comparisons framed around OAAN's footprint. A local
  article reads as the authority's guide to that place's allergies; a
  ranking of cities is national. The city priority below is internal, for
  choosing topics only, and never appears in an article.
- **City priority (internal)** (owner, 2026-10-24): cities served by small, single
  groups (3 or fewer locations) first: Tampa and St. Petersburg, the Toledo
  area (Findlay), the Indianapolis area (Westfield, Kokomo), Kansas City
  (Prairie Village), Grand Rapids, Charlotte, St. Louis, Dallas and Plano,
  Dayton, the Huntington, WV area (Barboursville), and Los Angeles (the
  owner wants local pages ready before a second LA practice starts ILIT).
  AllerPoint's cities (Richmond, Arlington/DC, Philadelphia) are borderline.
  Des Moines comes last.
- **Never list practices** (standing rule). End with Find a Provider with a
  zip from that city filled in and the state page, e.g.
  `/find-an-ilit-provider/florida`.

Both formats keep every other rule in this brief: Practical first, sources
on every fact, the emergency box where symptoms warrant it, longer term
options, and the fact check pass.

## Quality check before saving

- [ ] First paragraph answers the question.
- [ ] Every number, month and claim has a linked source you opened this run.
- [ ] No em dashes, no semicolons joining clauses, no banned words.
- [ ] Title 62 characters or fewer, meta description 70 to 155.
- [ ] Emergency section present if the topic needs one.
- [ ] Ends with longer term options, ILIT hedged and accurate, Find a Provider linked.
- [ ] No diagnosis, prices, practice endorsements or copied wording.
- [ ] Read it as a consumer: every section ends with something to do or
      know, no two sources argue in the body, and no fact is undercut by
      the next sentence.
- [ ] Every source older than five years is flagged in REVIEW NOTES, with
      the reason nothing newer was used.

## Fact check pass (every run, after the draft is saved)

Added 2026-10-23 after the Oral Allergy Syndrome article needed two rounds
of fixes after review. A writer checking their own work misses things, so
the check is done fresh, against the sources themselves, not the draft's
SOURCES notes.

**Who checks:** if the Agent tool is available, hand the saved draft to a
fresh general-purpose agent with the instructions below, and tell it to
edit only that draft file. If not, do the pass yourself after the draft is
saved, re-fetching every source rather than working from memory.

**Instructions for the checker:**
1. Re-fetch every source linked in the draft. For each factual sentence in
   the body, Key Takeaways and FAQs, find the supporting words on the source
   page. Fix any sentence the source doesn't support, or remove it.
2. **Wording strength:** the draft may not be firmer than the source.
   "Usually", "often", "may", "most", "rarely" in the source stay that way.
   Watch for "always", "never", "all", "only", "happens to people with".
3. **Lists and tables:** compare every list and table cell by cell against
   every source that has one, and against the source's own prose (the AAAAI
   chart and the AAAAI page listed different melons). Missing or extra
   items get fixed.
4. **Names and terms:** every alternate name, brand or term must appear in
   a cited source. Keywords from the brief or a competitor page are not
   facts.
5. **Disagreement:** where sources disagree, the article states both
   briefly or follows the stronger, newer source. Note it in REVIEW NOTES.
6. **Links:** every external link loads (status 200). Every internal link
   and `#anchor` exists: check the anchor ids in `src/app/(site)/` (e.g.
   `/learn-about-ilit#faq-fda` vs `#faq-safety`).
7. **Takeaways:** each one is stated and sourced in the body, with no
   source tags in parentheses.
7b. **Metadata (Google, 2026-10-01):** Google's generative AI guidance says
   to review metadata too, since it shows in search results. Check the
   title, meta description and image alt text against the body and the
   photo: no claim the body doesn't make, alt text describes what the photo
   actually shows (look at it, don't guess from the file name).
8. Add a **FACT CHECK** block to REVIEW NOTES: what was checked, every fix
   made (old wording → new wording and the reason), and anything that
   couldn't be verified. The end of run summary repeats the fixes.

## End of run summary

Reply with: the title and file name, word count, number of sources, the
REVIEW NOTES items, the fact check pass's fixes (and whether a separate
agent did it), and anything you skipped or couldn't verify. The owner
reads this in the Claude app.

## After publishing (main session only)

Once `scripts/publish-article.ts` has published a draft, move the file into
`content-drafts/articles/published/` with `git mv`, set its QUEUE.md status
to `published YYYY-MM-DD` and point its Draft file entry at
`published/<slug>.md`. The articles folder then only holds drafts still
waiting on the owner (owner's request, 2026-10-19). The drafting run never
moves files.

Then offer the owner a Pinterest pin for the new article (2026-10-20): add a
line to the PINS list in `OneDrive\Documents\OPEN AIR ALLERGY NETWORK\pinterest\make_pins.py`
(file name, Cloudinary path after `/upload/`, title, subtitle), run it, and
add the pin's copy to `pin-copy.md` in the same folder.
