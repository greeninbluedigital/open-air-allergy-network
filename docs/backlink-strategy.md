# Backlink strategy

Researched 2026-10-19. Goal: links that make Google (and AI search) trust
OAAN as *the* place to find ILIT, without anything that looks like a link
scheme. OAAN is a health site, which Google judges more strictly, so
relevance and editorial links count far more than volume.

## The short version

1. ~~Get the listed practices to link to their own OAAN page.~~ **Parked
   (2026-10-20):** practices aren't interested and most won't engage yet.
   Revisit once OAAN sends them measurable patient inquiries.
2. **Answer journalist requests** about allergies (free platforms), and
   **pitch local reporters** who cover new allergy treatments.
3. **Build one data page reporters will cite:** where ILIT is available,
   by state, updated quarterly.
4. **Set up a handful of brand profiles**, then stop. Skip mass directory
   lists, including the Nick Nolan list.

Measure monthly in Search Console (Links report) and GA4 referral traffic.

## Why not the free directory lists

Google's spam policies (Search Central, last updated 2026-08-28) define
link spam as links made mainly to manipulate rankings, and list
"low-quality directory or bookmark links" among the examples, along with
forum signature links and links in widgets spread across many sites.
Google mostly ignores links like these rather than penalizing them, so the
realistic outcome is hours of work for nothing.

The [Nick Nolan list](https://nick-nolan.medium.com/a-growing-list-of-free-do-follow-backlinks-f07a0ab1d7c0)
(May 2025) is that kind of list. The author checked 3,000 sites from a
bigger list and found 48 that worked, and those 48 are profile pages on
unrelated sites (Flickr, Giphy, Zazzle, Redbubble, Parler, 500px, file
hosts, generic business directories). None relate to allergies or health,
and his post ends by selling a service that builds 50 of them. A health
directory gains nothing from a Zazzle profile. **Recommendation: skip it.**

## 1. Practice links (parked 2026-10-20)

**Status:** the owner reports practices aren't interested in linking, and
most won't talk yet. They don't seem to see OAAN as a marketing tool when
it's presented as a membership network. Revisit when OAAN can show a
practice real inquiries it sent them. Original plan below.

A link from an allergy practice's own website to its OAAN page is about as
relevant as a link can be for us, and the practices benefit too (their
page sends them patients).

- **Offer a small "Find us on Open Air Allergy Network" badge** with a
  ready-to-paste HTML snippet linking to the practice's own page, plus a
  plain text version for practices whose web person won't paste code.
  Practices that keep in touch are the first to ask: Prairie (Dr.
  Everist), Elaria, Dayton, Bay Area.
- **Keep it voluntary.** Google's policy lists requiring links in terms
  of service or contracts as link spam, so never make a link a condition
  of the listing or the trial. Ask, don't require.
- **Anchor text stays plain:** the practice name or "Open Air Allergy
  Network", never keyword phrases like "best ILIT doctor".
- **Add one line to the welcome email and the edit form,** and add a step
  to `docs/onboarding-checklist.md` once the badge exists.
- Practices with a "Press" or "As seen on" section can list OAAN there.

Needs code: a badge image and a snippet page (small job). Not built yet.

## 2. Journalists and local news (start now)

**Journalist request platforms.** Reporters post questions and pick
sources to quote, usually with a link. HARO itself shut down with
Connectively in late 2024 (several 2026 guides; one says it has since
come back under Featured). Free options that load today:

| Platform | Cost | Notes |
|---|---|---|
| [Source of Sources](https://www.sourceofsources.com) | Free | Peter Shankman's newsletter, up to 3 digests a day, has a health category |
| [Featured](https://featured.com) | Free tier | Reporters post questions, you answer on the site |
| [Qwoted](https://www.qwoted.com) | Free tier (Pro about $149/month) | Skews toward health care and business reporters |
| [SourceBottle](https://www.sourcebottle.com) | Free | Smaller, some health and lifestyle |

Answer only allergy, immunotherapy and allergy season questions, two or
three a week, with something specific (a sourced fact from our articles,
where ILIT is available). **Decision for you:** who is quoted. These
platforms want a named person, so the source would be "David Greene,
founder of Open Air Allergy Network". That's off the site, so it doesn't
break the no-founder-persona rule for site content, but it's your call
whether to mention your own ILIT treatment.

**Local news.** Local TV and papers already cover ILIT as a novel
treatment. Example: WTVR in Richmond ran "unique allergy relief" on
2026-05-29 (reporter Brendan King) about AllerPoint's Dr. Jaimin Patel. It
linked to AllerPoint and to the AAFA allergy capitals page, and to nothing
that tells readers where else to find ILIT. That gap is our pitch:

- **When a practice newly offers ILIT** (like Dayton), pitch the local
  health reporter: new treatment in town, a patient-friendly explainer, and
  OAAN as the place readers in other cities can find a provider. Ask the
  practice first. They get press, we get the "where to find it" link.
- **Seasonal hooks**, sent two to three weeks ahead: cedar fever (Austin,
  San Antonio; December to February), spring tree pollen, ragweed (August
  to October). Each pitch points to the matching OAAN guide.
- Build a simple list (outlet, reporter, beat, date pitched, result) as a
  tab in the CRM file.

## 3. One data page reporters will cite (next 1 to 2 months)

Reporters link to data. OAAN has data nobody else publishes in one place:
how many practices offer ILIT, and where.

- **Page idea:** "Where to get ILIT in 2026": practice count by state
  (from the database, so it stays current), states with no provider, the
  largest metros covered, and how far the typical searcher travels (once
  the search logs have enough data). Built from `/find-an-ilit-provider/by-state`
  data, plus a short sourced explainer.
- **Careful with claims:** no "only directory" or "first" language, since
  other groups are building registries.
- **Use it in every pitch** in section 2, and update it quarterly with a
  dated "as of" line.

Needs code: a moderate job, mostly reusing the state page data.

## 4. Partnerships and resource pages (ongoing, low effort)

- **Auni ILIT Learning Network (AILN).** Its provider list
  (auniallergy.com/ilit-providers, ilitlearningnetwork.com) is the most
  relevant possible link source. It's already flagged as a priority
  partnership in the CRM. Ask whether they'd link to OAAN as a patient
  resource for finding providers outside their network.
- **Practices' patient resource pages,** for the guides themselves
  (allergy shots vs. drops vs. ILIT, dust mite, cedar fever). A practice is
  more likely to link a neutral explainer than a directory.
- **Sources we cite.** When an article leans on a university extension
  page or a nonprofit, a short note that we cited them occasionally earns
  a link back. Low odds, so only for sources with a "resources" or "in the
  news" page.

## 5. Brand profiles (one afternoon, then stop)

**Status 2026-10-20:** LinkedIn company page and the owner's LinkedIn
position done. Next: Facebook, Pinterest, Crunchbase.

These rarely pass ranking value (most are nofollow), but they help Google
connect the brand across the web and give searchers somewhere to check
OAAN is real. Create each with the same name, logo, description and site
link:

- LinkedIn company page
- Facebook page
- X or Bluesky (pick one you'll keep alive)
- Pinterest (the article hero photos fit naturally)
- Crunchbase

Google Business Profile isn't an option: it's for businesses that serve
customers in person, and OAAN is online only.

## Don't

- Buy links, link packages or "guest posts with a dofollow link" (Google
  lists paid links that pass credit as link spam).
- Trade links with other sites as a system (Google lists excessive link
  swaps).
- Post the site link in forums, comments or Reddit just for the link.
  Answering a question helpfully and mentioning OAAN where it truly helps is
  fine (it brings visitors), but expect no ranking value.
- Add OAAN to Wikipedia yourself (conflict of interest, and editors remove
  it).

## Measuring

- **Search Console → Links:** top linking sites, checked monthly.
- **GA4 → referral traffic:** which links send people.
- **Bing Webmaster Tools:** has its own backlink report (free).
- Log every link earned (date, site, how) in the CRM's Pipeline notes or
  a new tab, so we know which tactic works.

## Sources

- Google Search Central, [Spam policies for Google web search](https://developers.google.com/search/docs/essentials/spam-policies) (updated 2026-08-28)
- Nick Nolan, [A Growing List of Free Do-follow Backlinks](https://nick-nolan.medium.com/a-growing-list-of-free-do-follow-backlinks-f07a0ab1d7c0) (Medium, 2025-05-23)
- [HARO alternatives in 2026: every free platform, checked](https://blueleopardmedia.com/insights/haro-alternatives/) and [12+ Connectively (HARO) alternatives (for 2026)](https://www.prezly.com/academy/the-best-haro-alternatives)
- WTVR, [unique allergy relief](https://www.wtvr.com/news/local-news/unique-allergy-relief-may-29-2026) (2026-05-29)
- [High-quality link building for YMYL sites (2025)](https://www.ranktracker.com/blog/high-quality-link-building-for-ymyl-sites-2025/) (agency view, used only for general direction)
