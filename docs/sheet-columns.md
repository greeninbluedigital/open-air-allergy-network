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
