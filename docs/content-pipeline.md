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
   keywords, timing, shared sources such as the NC State pollen article and
   Anderegg et al. 2021). Also its "Published" table, so you don't repeat
   an existing article and you know what to link to.
4. `docs/metadata-rules.md`: title and meta description limits.
5. One published draft for format reference, e.g.
   `git show ab59a10^:content-drafts/how-often-do-you-get-allergy-shots.md`
   (reading git history is fine, changing it isn't).

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
  sources differ, show both. Paraphrase. Never copy another site's wording
  or structure. Direct quotes stay under 15 words and are rare.
- **Check every fact against the source page itself**, fetched during the
  run. Don't rely on memory for numbers, dates, months or study results.
- **Never diagnose.** The decision is between the reader and their doctor
  or allergist. Say so where it matters.
- **Emergency symptoms first.** If the topic overlaps an emergency (chest
  tightness, trouble breathing, throat or tongue swelling, anaphylaxis),
  open with a short "When to get care right away" section before anything else.
- **ILIT claims match the Learn page** (`/learn-about-ilit`): about three
  injections over about two months; FDA approved extracts given by an off
  label route; research is promising but smaller than for allergy shots. No
  cure claims, no guaranteed results, no "best" or "only". Hedge benefits
  ("may", "in studies").
- **No prices, insurance or payment details** for any practice. General
  education about cost is allowed only in an article planned for it.
- **No practice endorsements.** City pages may list the ILIT practices OAAN
  shows in that area, attributing any practice fact to the practice
  ("according to its website"). Link to their OAAN pages
  (`/find-an-ilit-provider/<slug>`), never to practice websites.
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
- Any article in content-ideas' "Published" table added since this list

## Draft file format

Save as `content-drafts/articles/<slug>.md`. Everything above `BODY` is
metadata the publish script reads, so keep the labels exactly:

```
<!--
DRAFT FOR REVIEW. Everything above the "BODY" line is page metadata, not
article text. Source links in the body open in a new tab.

Section: BLOG            (or LEARN)
Title (NN chars): ...    (max 62 characters)
URL: /blog/<slug>        (or /learn-about-ilit/<slug>)
Meta description (NN chars): ...   (70 to 155 characters)
Target keywords: "...", "..."
Tags: ...                (comma separated, from the tags already in use: Allergy Symptoms, Allergens, Allergy Testing, Comparisons, ILIT, SCIT, SLIT; propose a new tag only in REVIEW NOTES)
Feature image: TBD (owner uploads)
Image idea: one sentence describing a realistic, saturated, real setting photo (no faces, no clinic interiors)
Image alt: ...
Credit: none (house article).

KEY TAKEAWAYS
- 4 or 5 one-line takeaways, each with its source in parentheses

FAQS
Q: ...
A: ... (3 to 5 FAQs, each adds something the body doesn't, with a linked source)

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

## Quality check before saving

- [ ] First paragraph answers the question.
- [ ] Every number, month and claim has a linked source you opened this run.
- [ ] No em dashes, no semicolons joining clauses, no banned words.
- [ ] Title 62 characters or fewer, meta description 70 to 155.
- [ ] Emergency section present if the topic needs one.
- [ ] Ends with longer term options, ILIT hedged and accurate, Find a Provider linked.
- [ ] No diagnosis, prices, practice endorsements or copied wording.

## End of run summary

Reply with: the title and file name, word count, number of sources, the
REVIEW NOTES items, and anything you skipped or couldn't verify. The owner
reads this in the Claude app.
