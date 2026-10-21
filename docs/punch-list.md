# Punch list (owner's open items)

Updated 2026-10-19. Things raised in recent sessions that are still open,
newest decisions first. Cross items off or tell Claude, and this file gets
updated.

## To discuss or decide

1. **Homepage headline.** Alternatives to "Allergy treatment in months, not
   years", and the stat strip repeats "Months, not years".
2. **Numbered "How It Works" cards** (homepage, Learn page, ad landing
   pages). Readable but template looking. Light changes only, if any.
3. **Hero stat strip** ("Typically 3 visits / Months, not years / Often
   HSA/FSA eligible").
4. **Backlinks** (`docs/backlink-strategy.md`): Qwoted profile and LinkedIn
   company page done (10/20); practice links parked (practices not
   interested yet). Facebook Page done 10/20 (messaging auto reply, reviews
   off, five article posts planned, dust mite post scheduled for about
   11/10). Pinterest and Crunchbase done 10/20. All four profiles are in
   the homepage's Organization sameAs list. The "Where to get ILIT" data
   page is on hold until most practices are phone verified (reminder
   11/3). Aspire will take several calls over several days: its phone team's
   bookable ILIT offices differ from its website.
5. **City pages linking to neighboring states** (on hold since 10/15,
   until search logs show more searches from areas with no nearby practice).
6. **`docs/launch-checklist.md` is partly out of date.** It still lists a
   Vercel Pro upgrade and attorney reviews, which the 10/9 decisions
   replaced (stay on Hobby, no lawyer). Want it cleaned up?

## Your actions

7. **CRM:** check the new Pipeline tab. Confirm AllerPoint's status (was
   the mid-October note sent?) and send the OAAN note to Paullette at Bay
   Area. Once happy, tell Claude to delete the old tabs (Leads, Locations,
   Pipeline Summary, Definitions).
8. **Phone confirmations still missing** (no Verification Date, so no ILIT
   Confirmed badge): Elaria, St. Louis Family Allergy (both offices),
   AllerPoint Arlington and Philadelphia, and about 20 Aspire offices
   (waiting on Aspire HQ's list). Grand Rapids: doctor named on the ILIT
   page still unconfirmed.
9. **Search Console:** resubmit the sitemap if not done since the 10/2 crawl
   (Sitemaps → enter `sitemap.xml` → Submit). Request indexing for the dust
   mite guide if you'd like (Bing was notified automatically).
10. **Core Web Vitals check** on the live domain (PageSpeed Insights),
    pending since the 10/2 migration.
11. **Vercel Firewall:** switch Bot Protection to Challenge mode (reminder
    fired 10/13; skip if done).
12. **GTM and GA4 setup** (`docs/gtm-ga4-setup.md`), parked until after the
    legal question was settled. Includes linking Search Console to GA4.
13. **Account security:** two factor authentication everywhere, encrypt the
    laptop holding `.env`, and pick a retention period for patient
    inquiries (`docs/launch-checklist.md`).
14. **Google Alerts** for "Quillmoor Allergy" and "555-0142" (scraper trap).
15. **Logins to confirm** in `docs/accounts.md` (several still marked
    unknown).

## Waiting on others

16. **Dayton Allergy (Dr. Azmeh):** edit form or reply. Gmail reminds you
    10/24.
17. **Prairie Allergy (Dr. Everist):** asked about paid pricing. Next step
    not set.
18. **Elaria (Dr. Imanirad):** requested the pitch deck 10/15. Next step not
    set.
19. **Aspire HQ:** list of offices that offer ILIT.

## Content

20. **Tomorrow's article draft** is the first under the new "Practical
    first" rules. Watch whether it needs fewer review rounds.
21. **Link the sore throat article and "Allergies or a Cold?" to each
    other** once the sore throat article publishes.
22. **Learn page blog module:** switch back to provider-credited articles
    once a few exist.
23. **Not yet listed:** Kara Wada, MD (Columbus) and LA Center for ENT and
    Allergy (2 offices) need addresses. Auni's Bowling Green office isn't in
    the sheet yet.

## Done today (2026-10-19)

- Dayton Allergy & Asthma Care live (trial, ILIT confirmed by phone, Google
  review showing, welcome email sent).
- CRM corrected against the Providers sheet; new slim Pipeline tab.
- Custom message badge back on, for any practice that asks for one.
- Every visible em dash removed; "Getting Here" has a plane icon.
- Dust mite allergy guide published; "Practical first" drafting rules added.
- Published drafts moved into `content-drafts/articles/published/`.
- Bot traffic no longer counted in practice stats; `/api/` blocked in
  robots.txt.
