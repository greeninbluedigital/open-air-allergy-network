# Punch list (owner's open items)

Updated 2026-10-21. Things raised in recent sessions that are still open,
newest decisions first. Cross items off or tell Claude, and this file gets
updated.

## To discuss or decide

1. **Numbered "How It Works" cards** (homepage, Learn page, ad landing
   pages). Readable but template looking. Light changes only, if any.
2. **Backlinks** (`docs/backlink-strategy.md`): profiles done (Qwoted,
   LinkedIn, Facebook, Pinterest, Crunchbase, all in the site's sameAs);
   practice links parked. The "Where to get ILIT" data page is on hold until
   most practices are phone verified (reminder 11/3).
3. **City pages linking to neighboring states** (on hold since 10/15,
   until search logs show more searches from areas with no nearby practice).
4. **CRM simplification (parked 10/21).** The CRM is still too complex.
   Work through it together later; not now.
5. **Lead check back to every 15 minutes** once the site gets steady
   contact form leads. Slowed to hourly 10/26 because each run wakes the
   Neon database and the 15-minute schedule used most of the free compute
   allowance. One line in `.github/workflows/process-pending-leads.yml`.

## Your actions

6. **CRM:** check the new Pipeline tab. Confirm AllerPoint's status (was
   the mid-October note sent?) and send the OAAN note to Paullette at Bay
   Area. Once happy, tell Claude to delete the old tabs (Leads, Locations,
   Pipeline Summary, Definitions).
7. **Phone confirmations still missing** (no Verification Date, so no ILIT
   Confirmed badge): St. Louis Family Allergy (both offices),
   AllerPoint Arlington and Philadelphia, and about 20 Aspire offices
   (waiting on Aspire HQ's list). Grand Rapids: doctor named on the ILIT
   page still unconfirmed. Allergy Innovations (Kokomo and Westfield, IN,
   live on trial 10/21): confirm ILIT at both offices.
8. **Core Web Vitals (parked 10/21):** mobile PageSpeed lab score is 79
    (LCP 5.5s), mainly because Google Tag Manager loads at the top of the
    page. Search Console has too little real-visitor data to report
    (checked 10/21). No changes until its Core Web Vitals report flags
    mobile pages as Poor or Needs improvement. Ready fixes then: GTM at the standard Next.js timing, images served directly from
    Cloudinary.
9. **GTM and GA4 setup** (`docs/gtm-ga4-setup.md`), parked until after the
    legal question was settled. Includes linking Search Console to GA4.
10. **Account security:** two factor authentication everywhere, encrypt the
    laptop holding `.env`, and pick a retention period for patient
    inquiries (`docs/launch-checklist.md`).
11. **Logins to confirm** in `docs/accounts.md` (several still marked
    unknown).

## Waiting on others

12. **Dr. Priya Bansal (Asthma and Allergy Wellness Center, St. Charles,
    IL):** you emailed her 10/21 to ask about ILIT (a Reddit post says she
    offers it; her sites don't). List her only once she confirms.
13. **Dayton Allergy (Dr. Azmeh):** edit form or reply. Gmail reminds you
    10/24.
14. **Prairie Allergy (Dr. Everist):** asked about paid pricing. Next step
    not set.
15. **Elaria (Dr. Imanirad):** requested the pitch deck 10/15. Next step not
    set.
16. **Aspire HQ:** list of offices that offer ILIT.

## Content

17. **Queued articles (the weekday task drafts one each morning).** A
    weekly mix with one or two local stories (owner, 10/24). Next week:
    tree pollen (Mon), dust mites, chest tightness, Tampa Bay triggers
    (Thu), dog allergy. Full week by week plan at the top of the queue file.
    Where Do ILIT Injections Go? has its diagram ready and the wrap layout
    built. After the dust mites article, link it from the dust mite guide.
18. **Learn page blog module:** switch back to provider-credited articles
    once a few exist.
19. **Not yet listed:** LA Center for ENT and Allergy (2 offices) needs
    addresses. (Kara Wada, MD was added 10/25 as a trial, by zip only.) Auni's Bowling Green office isn't in
    the sheet yet.

## Recently done (2026-10-19 to 10-25)

- "ILIT" now paired with allergy or intralymphatic immunotherapy in page
  templates (state pages, practice titles and H1s, Learn FAQs, headings)
  and in 36 practice FAQ questions in the sync sheet.
- Monthly search watch set up (3rd of each month): new Google, Bing and AI
  search guidance plus a site audit, report in docs/search-watch/.
- About page filled out (what you'll find, privacy, how we create our
  content incl. AI disclosure, per Google's 10/1 AI content guidance);
  "Content Correction" added to the contact form. Fact check pass now also
  checks titles, descriptions and alt text.
- Toledo Allergies published 10/25 (AAFA rank 17th; first local story).
- Pinterest: all three boards created and every article pinned, scheduled
  through Nov 4. Facebook: all 18 articles scheduled, one a day
  through Nov 17.
- Ranking and how-to formats added to the drafting rules; 9 local and
  how-to articles queued after the seasonal items (incl. Los Angeles, ready
  for the second LA practice).
- Can Allergies Cause a Sore Throat? published 10/24 with the two-quarts
  jar photo, the first article photo wrapped beside the text (now the
  standard). Linked both ways with Allergies or a Cold?
- Homepage stat strip: the first two callouts merged into "Typically 3
  visits instead of 3 years of allergy shots" (10/23). Key Takeaways no
  longer carry source tags.
- Oral Allergy Syndrome published 10/23 (fact checked twice; new "vs. food
  allergy" section). Elaria photos live.
- Google Alerts set up (10/22) for "Quillmoor", "555-0142" and
  "Tennyfield" (scraper trap), daily, all results.
- Launch checklist cleaned up for the 10/9 decisions (Hobby, no lawyer);
  anything that needs charging practices or counsel moved to its own
  section.
- 8 articles queued from your Ahrefs research (oral allergy syndrome, one
  time allergy shot, tree pollen, dog allergy, puffy eyes, test results,
  what's in allergy shots, Ohio grass pollen). Queue reordered by volume,
  then season. Rate limit stays on Log (Hobby keeps only 24 hours of
  firewall history). Avant's Quick-LI history noted in the CRM.
- Allergy Innovations (Kokomo and Westfield, IN) live on trial with bios
  and FAQs; Dr. Priya Bansal added to the CRM. Bot Protection on Challenge.
- Homepage headline is now "Most allergy treatment takes years. Yours could
  take months." and the stat strip says "A few months, start to finish".
- Kenalog article published with hero and pin; "Allergy Medicine" tag and
  a medicine article series idea added.
- ILIT vs. Traditional Allergy Shots refreshed (sourced, guide tag).
- New articles always publish to the Blog; the Learn page shows guides by
  the "Allergy Treatment Guides" tag (fixed core row, newest three, short
  list, "See all"). Austin, ragweed, cedar fever and dust mite moved to
  /blog with redirects; Dallas moved without one.
- Blog Featured row pinned (How Often, Traveling for ILIT, Cat Allergy);
  the list under the cards no longer repeats them.
- "Groin" now reads "in the groin (just below the waist, near the hip)"
  across articles, the Learn FAQ, and 74 practice bios and FAQs.
- Dust mite guide answers "what do they look like"; dedicated article
  queued.
- Monthly provider search moved to a local task that checks the Providers
  sheet and CRM, writing to the CRM's Candidates tab; Richmond Allergy
  noted as AllerPoint Henrico.
- Dayton Allergy live; brand profiles done; Qwoted profile set up.
