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
| I | Phone | |
| J | Website | |
| K | Tier | One of: `Freemium`, `Verified`, `Full Profile`, `Featured` |
| L | Founding Member | `Y` / `N` |
| M | Geo-Extension | `Y` / `N` |
| N | Active | `Y` / `N` |
| O | Verification Date | Any parseable date, e.g. `2026-09-01` |
| P | Verification Notes | |
| Q | Offers Video Consult | `Y` / `N` |
| R | Offers Phone Consult | `Y` / `N` |
| S | Short Bio | |
| T | Extended Bio | |
| U | Provider Photo URL | Must already be hosted somewhere (no upload yet) |
| V | Secondary Photo URLs | Semicolon-separated, up to 4 |
| W | Business Hours | Semicolon-separated, e.g. `Tue-Fri: 8am-5pm; Sat: 9am-1pm` |
| X | ILIT Schedule Notes | |
| Y | Treatments Offered | Semicolon-separated, e.g. `ILIT; SCIT; Food Allergy Testing` |
| Z | Show Google Reviews | `Y` / `N` |
| AA | Google Place ID | |
| AB | Custom Field 1 | |
| AC | Custom Field 2 | |
| AD | Notes | Internal only |

**Deliberately excluded** (not sheet-managed):
- Subscription Status, Billing Reference, Next Billing Date — set by Stripe
  webhooks once billing is built, not hand-entered.
- Search Radius — derived automatically (200mi, or 600mi if Geo-Extension is
  `Y`), never a manual input.
- Lat/Long — computed by the sync job via Mapbox geocoding; never enter these
  yourself.

Share the sheet with the service account's email (**Viewer** access is
enough — the sync never writes back to the sheet).
