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
| E | City | |
| F | State | Two-letter code |
| G | Zip | |
| H | Phone | |
| I | Website | |
| J | Tier | One of: `Free/Claimed`, `Verified`, `Full Profile`, `Featured` |
| K | Founding Member | `Y` / `N` |
| L | Geo-Extension | `Y` / `N` |
| M | Active | `Y` / `N` |
| N | Verification Date | Any parseable date, e.g. `2026-09-01` |
| O | Verification Notes | |
| P | Offers Video Consult | `Y` / `N` |
| Q | Offers Phone Consult | `Y` / `N` |
| R | Short Bio | |
| S | Extended Bio | |
| T | Provider Photo URL | Must already be hosted somewhere (no upload yet) |
| U | Secondary Photo URLs | Semicolon-separated, up to 4 |
| V | Business Hours | Semicolon-separated, e.g. `Tue-Fri: 8am-5pm; Sat: 9am-1pm` |
| W | ILIT Schedule Notes | |
| X | Treatments Offered | Semicolon-separated, e.g. `ILIT; SCIT; Food Allergy Testing` |
| Y | Show Google Reviews | `Y` / `N` |
| Z | Google Place ID | |
| AA | Custom Field 1 | |
| AB | Custom Field 2 | |
| AC | Notes | Internal only |

**Deliberately excluded** (not sheet-managed):
- Subscription Status, Billing Reference, Next Billing Date — set by Stripe
  webhooks once billing is built, not hand-entered.
- Search Radius — derived automatically (200mi, or 600mi if Geo-Extension is
  `Y`), never a manual input.
- Lat/Long — computed by the sync job via Mapbox geocoding; never enter these
  yourself.

Share the sheet with the service account's email (**Viewer** access is
enough — the sync never writes back to the sheet).
