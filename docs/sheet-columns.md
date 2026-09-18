# Google Sheet setup for the sync job

Tab name must be exactly **"Providers"**. Row 1 is headers (any text is fine,
row 2 onward is data — column *position* is what matters, not the header
text). Column order:

| # | Column | Notes |
|---|--------|-------|
| A | Slug | Required, unique, url-safe (e.g. `example-ilit-center`) — this is the matching key |
| B | Group ID | Optional — same value across sibling locations. No required format; suggested convention: `<brand-slug>-group` (e.g. `example-ilit-group`) |
| C | Practice Name | |
| D | Address | Street address only |
| E | Address Line 2 | Optional — suite/floor/unit, e.g. `Suite 200`. Kept separate so the geocoder only ever sees the street line |
| F | City | |
| G | State | Two-letter code |
| H | Zip | |
| I | Phone | Patient-facing |
| J | Website | |
| K | Notification Email | **New** — where lead notifications get sent (not shown publicly). Required for the practice to actually receive PDP/SEM contact-form leads |
| L | Tier | One of: `Freemium`, `Verified`, `Full Profile`, `Featured` |
| M | Founding Member | `Y` / `N` |
| N | Geo-Extension | `Y` / `N` |
| O | Active | `Y` / `N` |
| P | Verification Date | Any parseable date, e.g. `2026-09-01` |
| Q | Verification Notes | |
| R | Offers Video Consult | `Y` / `N` |
| S | Offers Phone Consult | `Y` / `N` |
| T | Short Bio | |
| U | Extended Bio | |
| V | Provider Photo URL | Upload to Cloudinary's Media Library (res.cloudinary.com — the only host the site's `next/image` config currently allows) and paste the resulting URL here |
| W | Secondary Photo URLs | Semicolon-separated, up to 4 |
| X | Business Hours | Semicolon-separated, e.g. `Tue-Fri: 8am-5pm; Sat: 9am-1pm` |
| Y | ILIT Schedule Notes | |
| Z | Treatments Offered | Semicolon-separated, e.g. `ILIT; SCIT; Food Allergy Testing` |
| AA | Show Reviews | **Renamed** from "Show Google Reviews" — `Y` / `N`, one master toggle for the whole Patient Reviews module (Featured tier only regardless of this flag). Which platform(s) actually render depends on whether Google Place ID / any Yelp field below is filled in |
| AB | Google Place ID | |
| AC | Yelp Embed Code 1 | **New** — paste from Yelp's own free "Embed Review" feature (the "···" menu on any review on Yelp's site). Not the Fusion API |
| AD | Yelp Embed Code 2 | **New** — same as above |
| AE | Yelp Embed Code 3 | **New** — same as above. Exactly 3 slots, no more |
| AF | Yelp Business ID | **New** — the practice's Yelp business ID or alias (from its Yelp page URL, e.g. `example-ilit-allergy-center-beverly-hills`). Not used yet (see below) — filling it in now means switching on live Yelp ratings later needs no sheet changes |
| AG | Yelp Rating Badge Embed | **New** — paste a free rating-badge widget snippet (from Yelp for Business, or a free-tier third-party like Elfsight/TagEmbed). Self-updates on the widget's own end at zero cost. Shown only until a real Yelp API rating is active (see below) |
| AH | Custom Field 1 | |
| AI | Custom Field 2 | |
| AJ | Notes | Internal only |
| AK | Demo/Example Listing | **New** — `Y` / `N`. For sales-demo practices only (showing a prospective client what a PDP/SEM page looks like without using a competitor or a page real traffic could land on). `Y` excludes the listing from SRP search results and the sitemap, and adds `noindex`/`nofollow` to its PDP — reachable only by whoever has the direct link. Use a dedicated Group ID like `example-practice-group` if you want several demo practices grouped for your own reference, but note Group ID's real purpose is cross-linking sibling locations on the PDP ("Other Locations") — don't group unrelated demo practices together or they'll cross-link each other on the page you're showing a client |
| AL | SRP Card Photo URL | **New** — a square-friendly Cloudinary URL for the small photo on the SRP result card. Deliberately separate from Provider Photo URL (V): that one is portrait-oriented for the PDP and crops badly at the SRP card's small square size. Leave blank and the card simply shows no photo (not a placeholder box) — no image is required |

**Deliberately excluded** (not sheet-managed):
- Subscription Status, Billing Reference, Next Billing Date — set by Stripe
  webhooks once billing is built, not hand-entered.
- Search Radius — derived automatically (200mi, or 600mi if Geo-Extension is
  `Y`), never a manual input.
- Lat/Long — computed by the sync job via Mapbox geocoding; never enter these
  yourself.
- Google review *content* and rating — pulled by the daily `/api/reviews/refresh`
  cron via the Places API, not sheet-entered at all.
- Yelp rating/review count — cron-managed once `YELP_API_KEY` is set (Yelp's
  Fusion API is a paid product, not turned on yet). Until then, AG's badge
  widget is what displays. No sheet change needed when this switches on.

Share the sheet with the service account's email (**Viewer** access is
enough — the sync never writes back to the sheet).

## Second tab: "SEM Landing Pages"

Tab name must be exactly **"SEM Landing Pages"**. One row per landing page —
a practice can have as many as you want (one per target metro), each
reachable at `/lp/<practice-slug>/<url-slug>`. Row 1 is headers, row 2
onward is data, same position-based rule as the Providers tab.

| # | Column | Notes |
|---|--------|-------|
| A | Provider Slug | Must match an existing row's Slug on the Providers tab exactly — this is how a landing page is tied to a practice. Can be left blank on rows after the first for the same practice — it fills down from the last non-blank value above it |
| B | URL Slug | Becomes the URL, e.g. `sf-bay-area` → `/lp/example-ilit-center/sf-bay-area`. Url-safe, unique per practice (a practice can reuse the same URL Slug another practice already used, since the full path also includes the practice's own slug) |
| C | Target Metro Name | Display name shown on the page, e.g. `SF Bay Area` |
| D | Travel Narrative | Optional flavor text about traveling in from that metro |
| E | Active | `Y` / `N`. Sync never deletes a landing page row that's removed from the sheet — set this to `N` to take one down rather than deleting the row |

Like the Providers tab, sync only ever creates/updates rows here, never
deletes — `(Provider Slug, URL Slug)` is the matching key.

## Third tab: "FAQs"

Tab name must be exactly **"FAQs"**. One row per question. **Unlike the two
tabs above, this one behaves as a full replace, not an upsert**: on every
sync, each practice's entire set of FAQs in Prisma is wiped and recreated
from whatever's currently in the sheet for that practice. That's
deliberate — a question has no natural stable identity the way a URL slug
does, so this is the only way editing or deleting a row here actually
takes effect. Row 1 is headers, row 2 onward is data.

| # | Column | Notes |
|---|--------|-------|
| A | Provider Slug | Must match an existing row's Slug on the Providers tab. Same fill-down rule as SEM Landing Pages — leave it blank on every row after the first for a given practice and it carries down from the last non-blank value above |
| B | Question | |
| C | Answer | |
| D | Sort Order | Optional — a number controlling display order. Leave blank and the sheet's own row order is used instead |

Practical implication of the full-replace behavior: don't leave a practice's
FAQ rows half-edited mid-session if you can help it — a sync running while
you're only partway through editing will recreate that practice's FAQs from
whatever's currently saved in the sheet at that moment, blank rows and all
(a row missing a Question or Answer is just skipped, not treated as
"delete everything").
