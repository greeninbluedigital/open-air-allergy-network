# Analytics: what we measure, and how

The reference for every number OAAN tracks, what it means, and how it's
counted. If a report or a sales conversation needs a definition, it should
be here. Last updated 2026-09-28.

There are three separate sources of numbers:

1. **OAAN's own event log** (the `AnalyticsEvent` table): per-practice
   metrics for provider reports. Everything in the first section below.
2. **Leads** (`ContactSubmission`, `PracticeLead`, `GeneralInquiry`): form
   submissions. Defined in `docs/lead-forms.md`, summarized below.
3. **Google Analytics 4** via Google Tag Manager: sitewide traffic. Live
   (confirmed 2026-09-29): GTM container `GTM-P3J8T24W` (set as
   `NEXT_PUBLIC_GTM_ID`) loads a Google tag for GA4 property
   `G-S8P8XYEGMP`, on the production site only. The site sends its own
   `oaan_*` events (CTA clicks, provider searches, leads, and the provider
   events above) to Tag Manager. The event list, Tag Manager and GA4 setup,
   and report recipes are in `docs/gtm-ga4-setup.md`.

## Provider metrics (for practice reports)

| Metric | Event type | Counted when | Where it happens |
|---|---|---|---|
| Search result impressions | `SRP_IMPRESSION` | The practice's result card is a **viewable impression** (see definitions) | Find a Provider results list |
| Homepage impressions | `HOMEPAGE_IMPRESSION` | Same, for its card in the homepage section | Homepage "ILIT Providers Near {city}" (every listing level since 2026-10-09; Featured only from 2026-10-02, Full Profile too before that) |
| Nearby impressions | `PDP_NEARBY_IMPRESSION` | Same, for its card on another practice's page | A Freemium practice's page, "Other ILIT Providers Near {city}" (every listing level since 2026-10-09; Full Profile and Featured only before) |
| Provider page views | `PAGE_VIEW` | The page loads in a visitor's browser (not a viewability measure) | Provider pages (every tier, Freemium included) and SEM landing pages. Tell them apart by path: SEM pages start with `/lp/` |
| Phone clicks | `PHONE_CLICK` | A visitor clicks or taps the practice's phone number | Provider page contact panel, SEM landing pages, and the phone fallback in the lead form's email error |
| Website clicks | `WEBSITE_CLICK` | A visitor clicks the practice's website link | Provider page contact panel and SEM landing pages |
| Address clicks | `ADDRESS_CLICK` | A visitor clicks the practice's address, which opens it in Google Maps | Provider page and SEM landing page contact panels |
| Email clicks | `EMAIL_CLICK` | A visitor clicks "Email {practice}" (opens their own email app) or copies the practice's email address | The contact panel's email button (added 2026-10-09), shown instead of the form to visitors in a consumer health data state (WA, NV, CT) and on practices located in one, or after a "Yes" to the form's location question. OAAN never sees the message, so this click is the only lead signal there |
| Profile clicks (soft lead) | `PROFILE_CLICK` | A visitor clicks "View full provider profile" on an SEM landing page, going to the practice's main page | SEM landing pages |

Impressions are recorded for every practice shown, whatever its tier. A
report would normally only cover paying practices.

**Lead actions** are the four ways a visitor reaches out to or heads toward
a practice: form submissions (see Leads below), phone clicks, website clicks,
and address clicks. Report them separately and as a total. A practice with
healthy page views but few lead actions, or too few page views overall, is
a candidate for targeted SEM.

**Soft leads:** profile clicks from SEM landing pages. The visitor didn't
contact the practice, but chose to learn more about it. Reported to
practices separately from the four lead actions.

## Definitions and counting rules

**Viewable impression.** At least 50% of the practice's card is on screen
for at least one continuous second. This is the advertising industry's
standard for display ads (IAB/MRC). A card that loads below the fold and
is never scrolled to doesn't count. A page in a hidden or background tab
never counts, because the browser doesn't report visibility for it.

**Once per list, per page load.** A practice counts once per list (the
impression type plus the page URL). Moving around the site with links and
coming back doesn't count it again. A full reload does, and so does a new
search (a different URL counts as a different list).

**Page views count every load**, including reloads. They aren't
de-duplicated.

**Phone clicks** count the click or tap itself, not completed calls. On a
phone the tap starts dialing. On a desktop the number is already shown on
the page, so most desktop visitors just read it and dial, and those calls
aren't counted. Phone clicks mostly measure mobile callers. Counting every
call would need call tracking numbers (a future option).

**Website and address clicks** count the click. Both open in a new tab, so
what happens on the practice's site or in Google Maps isn't measured.

**Search results on phones.** On narrow screens the Find a Provider page
shows the list or the map, one at a time. It opens on the list (since
2026-09-28), so phone visitors see the cards, badges, and Featured group
first. A visitor who switches to the Map view stops generating search
impressions, because map pins aren't counted as impressions. On tablets
and desktops the map and list show side by side.

## What's excluded, and what isn't

Excluded:
- Visitors whose browser doesn't run JavaScript, which covers most search
  engine crawlers.
- Automated browsers that identify themselves as automated
  (`navigator.webdriver`).

**Not** excluded:
- Your own visits and testing. Check the site in a separate browser
  profile if you don't want those counted, or ask for rows to be deleted.
- Bots that run JavaScript and hide that they're automated. They're
  uncommon but can inflate counts.

Some privacy extensions may block the tracking request and undercount.
Treat all of these as close approximations, and say "approximately" in
client reports.

## What's stored

Each `AnalyticsEvent` row holds only: the event type, the practice's id,
the page path (including a searched zip, e.g.
`/find-an-ilit-provider?zip=90012`), UTM campaign fields (page views on SEM
pages), and a timestamp. **No visitor identifiers are stored**: no IP
address, cookie id, name, or email. A row can't be traced back to a person.

## Leads (summary)

Defined in full in `docs/lead-forms.md`. For reports, the useful lead counts
per practice are: inquiries submitted, inquiries the patient confirmed
(forwarded as **[Verified]**), and inquiries auto-forwarded after about an
hour without confirmation (**[Unverified]**).

## Getting the numbers

There's no report screen yet. Ask Claude for any practice and date range,
or run this in the Neon SQL console (replace the practice slug and dates):

```sql
SELECT e.type, COUNT(*) AS total
FROM "AnalyticsEvent" e
JOIN "Provider" p ON p.id = e."providerId"
WHERE p.slug = 'avant-allergy-los-angeles'
  AND e."createdAt" >= '2026-10-01'
  AND e."createdAt" <  '2026-11-01'
GROUP BY e.type
ORDER BY e.type;
```

## Not measured (yet)

- In GA4, the site's `oaan_*` events until the Tag Manager trigger and tag
  in `docs/gtm-ga4-setup.md` are set up and published.

## Where it lives in the code

| Piece | File |
|---|---|
| Viewable impression tracking | `src/components/analytics/ViewableImpression.tsx` (wraps each card via `ProviderCard`'s `impressionType`) |
| Page views | `src/components/analytics/PageViewTracker.tsx` |
| Phone clicks | `src/components/PhoneLink.tsx` |
| Website and address clicks | `src/components/analytics/TrackedLink.tsx` |
| Shared client sender (page views and clicks; also pushed to GTM's dataLayer) | `src/lib/track.ts` |
| Endpoint that saves every event | `src/app/api/events/route.ts` |
| Event types | `AnalyticsEventType` in `prisma/schema.prisma` |

## Change log

- **2026-10-02:** search results gained an out-of-area section (Geo-Extension practices beyond the patient's radius, up to 600 miles). Those cards also count as SRP_IMPRESSION.
- **2026-09-28:** impression tracking added (homepage, search results,
  Freemium page nearby section), switched the same day from "counted on page
  load" to viewable impressions. All test rows were deleted, so impression
  counts start from the switch.
- **2026-09-28:** Freemium provider page views now tracked, the same as paid
  pages (useful for upgrade pitches: "your free listing was viewed N times
  last month"). Before this date, only Verified and up were counted. Find a
  Provider on phones now opens on the list instead of the map.
- **2026-09-28:** website clicks and address clicks added (provider pages;
  website clicks on SEM pages too). Earlier dates have no data for these.
- **2026-09-29:** GA4 events added (CTA clicks, provider searches, lead
  submissions; `docs/gtm-ga4-setup.md`). Leads now also save the campaign
  keyword, ad variant, ad click id, and landing page, remembered for 30 days
  from the campaign visit (`oaan_attr` cookie). Tag Manager now loads on
  production only.
- **2026-09-30:** SEM landing pages now use the provider page's contact
  panel, so address clicks are tracked there too (website clicks already
  were). New SEM button ids in `docs/gtm-ga4-setup.md`.
- **2026-09-30:** profile clicks from SEM landing pages recorded as
  `PROFILE_CLICK`, a soft lead. SEM pages also got a phone-only "Send a
  Message" bar pinned to the bottom of the screen (`sem_sticky_send_message`).
