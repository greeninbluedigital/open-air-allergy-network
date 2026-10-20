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
   `content-drafts/articles/published/allergies-or-a-cold.md`. Every
   published article's draft is in that folder, which also helps with the
   repeated FAQ check. Read those files, never edit or move them.

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
Feature image: TBD (owner uploads)   (or the URL from the queue row's Hero image column, if filled)
Image idea: one sentence describing a realistic, saturated, real setting photo (no faces, no clinic interiors)
Image alt: ...
Credit: none (house article).

KEY TAKEAWAYS
- 4 or 5 one-line takeaways, each with its source in parentheses

FAQS
Q: ...
A: ... (6 to 9 FAQs, each a question people actually search: season, symptoms, the allergen's other names, related allergies, treatment timing. Each answer stands alone in 2 or 3 sentences with a linked source, and may restate a body fact in direct answer form. Never repeat another FAQ on this page or a question already used on another published article. **Check every question against Google autocomplete** with WebFetch on `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=<question words>`, try a few phrasings, and use the wording people actually type. Watch what the suggestions mean, e.g. "cedar fever drops" turned out to be store bought homeopathic products. Note in REVIEW NOTES which FAQs autocomplete confirmed; an unconfirmed FAQ can stay if it's useful)

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

## End of run summary

Reply with: the title and file name, word count, number of sources, the
REVIEW NOTES items, and anything you skipped or couldn't verify. The owner
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
