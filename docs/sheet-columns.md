# Google Sheet setup for the sync job

Tab name must be exactly **"Providers"**. Row 1 is headers (any text is fine,
row 2 onward is data — column *position* is what matters, not the header
text). Column order:

| # | Column | Notes |
|---|--------|-------|
| A | Slug | Required, unique, url-safe (e.g. `example-ilit-center`) — this is the matching key |
| B | Group ID | Optional — same value across sibling locations |
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
| V | Provider Photo URL | Must already be hosted somewhere (no upload yet) |
| W | Secondary Photo URLs | Semicolon-separated, up to 4 |
| X | Business Hours | Semicolon-separated, e.g. `Tue-Fri: 8am-5pm; Sat: 9am-1pm` |
| Y | ILIT Schedule Notes | |
| Z | Treatments Offered | Semicolon-separated, e.g. `ILIT; SCIT; Food Allergy Testing` |
| AA | Show Reviews | **Renamed** from "Show Google Reviews" — `Y` / `N`, one master toggle for the whole Patient Reviews module (Featured tier only regardless of this flag). Which platform(s) actually render depends on whether Google Place ID / any Yelp field below is filled in |
| AB | Google Place ID | |
| AC | Yelp Embed Code 1 | **New** — paste from Yelp's own free "Embed Review" feature (the "···" menu on any review on Yelp's site). Not the Fusion API |
| AD | Yelp Embed Code 2 | **New** — same as above |
| AE | Yelp Embed Code 3 | **New** — same as above. Exactly 3 slots, no more |
| AF | Yelp Rating | **New** — manually updated, e.g. `4.5`. Yelp has no free first-party rating badge |
| AG | Yelp Review Count | **New** — manually updated, e.g. `128` |
| AH | Custom Field 1 | |
| AI | Custom Field 2 | |
| AJ | Notes | Internal only |

**Deliberately excluded** (not sheet-managed):
- Subscription Status, Billing Reference, Next Billing Date — set by Stripe
  webhooks once billing is built, not hand-entered.
- Search Radius — derived automatically (200mi, or 600mi if Geo-Extension is
  `Y`), never a manual input.
- Lat/Long — computed by the sync job via Mapbox geocoding; never enter these
  yourself.
- Yelp/Google review *content* beyond what's listed above — Google review
  excerpts are pulled live via an API, not sheet-entered at all.

Share the sheet with the service account's email (**Viewer** access is
enough — the sync never writes back to the sheet).
