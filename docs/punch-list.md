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
4. **`docs/launch-checklist.md` is partly out of date.** It still lists a
   Vercel Pro upgrade and attorney reviews, which the 10/9 decisions
   replaced (stay on Hobby, no lawyer). Want it cleaned up?

## Your actions

5. **CRM:** check the new Pipeline tab. Confirm AllerPoint's status (was
   the mid-October note sent?) and send the OAAN note to Paullette at Bay
   Area. Once happy, tell Claude to delete the old tabs (Leads, Locations,
   Pipeline Summary, Definitions).
6. **Phone confirmations still missing** (no Verification Date, so no ILIT
   Confirmed badge): Elaria, St. Louis Family Allergy (both offices),
   AllerPoint Arlington and Philadelphia, and about 20 Aspire offices
   (waiting on Aspire HQ's list). Grand Rapids: doctor named on the ILIT
   page still unconfirmed.
7. **Search Console:** resubmit the sitemap if not done since the 10/2 crawl
   (Sitemaps → enter `sitemap.xml` → Submit). Optional: request indexing for
   new or moved pages (Kenalog, the refreshed ILIT vs. allergy shots, and the
   blog addresses of ragweed, cedar fever, dust mite and Austin). Bing is
   notified automatically.
8. **Core Web Vitals:** mobile PageSpeed is 79 (LCP 5.5s), held back mainly
    by Google Tag Manager loading at the top of the page. Fix options under
    discussion (10/21).
9. **Vercel Firewall:** switch Bot Protection to Challenge mode (reminder
    fired 10/13; skip if done).
10. **GTM and GA4 setup** (`docs/gtm-ga4-setup.md`), parked until after the
    legal question was settled. Includes linking Search Console to GA4.
11. **Account security:** two factor authentication everywhere, encrypt the
    laptop holding `.env`, and pick a retention period for patient
    inquiries (`docs/launch-checklist.md`).
12. **Google Alerts** for "Quillmoor Allergy" and "555-0142" (scraper trap).
13. **Logins to confirm** in `docs/accounts.md` (several still marked
    unknown).

## Waiting on others

14. **Dayton Allergy (Dr. Azmeh):** edit form or reply. Gmail reminds you
    10/24.
15. **Prairie Allergy (Dr. Everist):** asked about paid pricing. Next step
    not set.
16. **Elaria (Dr. Imanirad):** requested the pitch deck 10/15. Next step not
    set.
17. **Aspire HQ:** list of offices that offer ILIT.

## Content

18. **Upcoming drafts:** Why People Quit Allergy Shots (hero ready), then
    What Do Dust Mites Look Like? (then link it from the dust mite guide),
    Houston, and Where Do ILIT Injections Go? (diagram ready; build the
    text wrap layout at publish). The "Practical first" rules seem to be
    working: Kenalog needed only two comments.
19. **Link the sore throat article and "Allergies or a Cold?" to each
    other** once the sore throat article publishes.
20. **Learn page blog module:** switch back to provider-credited articles
    once a few exist.
21. **Not yet listed:** Kara Wada, MD (Columbus) and LA Center for ENT and
    Allergy (2 offices) need addresses. Auni's Bowling Green office isn't in
    the sheet yet.

## Recently done (2026-10-19 to 10-21)

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
