# Google Sheet setup for the sync job

Tab name must be exactly **"Providers"**. Row 1 is headers (any text is fine,
row 2 onward is data — column *position* is what matters, not the header
text). Column order:

| # | Column | Notes |
|---|--------|-------|
| A | Provider Slug | Required, unique, url-safe (e.g. `example-ilit-center`) — this is the matching key |
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
| A | Provider Slug | Must match an existing row's Provider Slug on the Providers tab exactly — this is how a landing page is tied to a practice. Required on every row — no fill-down; a blank cell here means the row is skipped, not inherited from the row above |
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
| A | Provider Slug | Must match an existing row's Provider Slug on the Providers tab. Required on every row — no fill-down; retype it on every FAQ row for a given practice, a blank cell means that row is skipped |
| B | Question | |
| C | Answer | |
| D | Sort Order | Optional — a number controlling display order. Leave blank and the sheet's own row order is used instead |

Practical implication of the full-replace behavior: don't leave a practice's
FAQ rows half-edited mid-session if you can help it — a sync running while
you're only partway through editing will recreate that practice's FAQs from
whatever's currently saved in the sheet at that moment, blank rows and all
(a row missing a Question or Answer is just skipped, not treated as
"delete everything").

## Fourth tab: "Learn Page Credits"

Tab name must be exactly **"Learn Page Credits"**. Manages the
"Medically reviewed by" credit on `/learn-about-ilit/[slug]` cluster pages
(the keyword-targeted comparison/education content — see
`docs/blog-content-guide.md`). This tab does **not** manage page content
(title/body/tags) — those pages are database-authored the same way blog
articles are; this tab only assigns and approves who gets credited. Row 1 is
headers, row 2 onward is data.

| # | Column | Notes |
|---|--------|-------|
| A | Page Slug | Must match an existing `/learn-about-ilit/[slug]` article's slug — the article has to already exist (create it first, same as any Blog article). **If an article's slug is ever renamed, update this cell to the new slug too**, or the next sync logs an error for the old slug and clears the credit on the renamed article |
| B | Provider Slug | Must match an existing row's Provider Slug on the Providers tab. That provider also needs at least one linked practitioner on the **Practitioners** tab (below) — same requirement as a Blog contribution |
| C | Practitioner Slug | Optional. Only needed if the provider has more than one practitioner on the Practitioners tab — picks which one gets credited. Leave blank and the sync uses whichever practitioner is linked (fine for the common case of exactly one) |
| D | Approved | `Y` / `N` — the actual on/off switch. The "Medically reviewed by" box only renders when this is `Y`, regardless of whether the author/provider links are set. Set to `N` (or delete the row) to pull the credit immediately on the next sync — e.g. a Featured subscription lapses |
| E | Notes | Internal only — your own record of how/when you got documented approval. Not used by the sync logic |

Behavior notes:
- A page's credit only updates when something in the row actually changed
  (author, provider, or approval status) — this keeps the visible "Last
  reviewed" date (which is the article's `lastUpdated`, bumped automatically
  on any real change) from creeping forward on every sync run when nothing
  was actually reviewed.
- A page mentioned in a *previous* sync but missing from the sheet now has
  its approval cleared automatically (`Approved` forced to `N`) — this is
  how deleting or blanking a row turns a credit off, without destroying the
  underlying author/provider links in case the same practice gets
  re-approved later.

## Fifth tab: "Practitioners"

Tab name must be exactly **"Practitioners"**. One row per person, not per
provider — separate from Providers because a practice can have more than one
credited practitioner, and a practitioner can be affiliated with more than
one location (e.g. a doctor at two sibling practices). This is what actually
creates/manages `Author` records now — no more Prisma Studio for this part.
Upsert-by-key like Providers/SEM Landing Pages: editing Display Name or Bio
on an existing row just updates it. Row 1 is headers, row 2 onward is data.

| # | Column | Notes |
|---|--------|-------|
| A | Practitioner Slug | Required, unique, url-safe (e.g. `sandra-ho`) — this is the matching key |
| B | Provider Slug(s) | Required, at least one. Semicolon-separated if affiliated with multiple locations, e.g. `avant-allergy-los-angeles; avant-allergy-santa-monica`. Each must match an existing Provider Slug. This list is reconciled exactly to what's in the cell on every sync — removing a slug here removes that affiliation, it doesn't just stop adding new ones |
| C | Display Name | Required — the exact text shown in bylines, e.g. `Dr. Sandra Ho, MD`. Include whatever title/credentials you want displayed; there's no separate title field, this is the whole string |
| D | Bio | Optional — shown under the credit box on Blog/Learn pages when set |

Used by both the Blog's "Contributed by" credit (set via direct DB write,
see `docs/blog-content-guide.md`) and the Learn Page Credits tab above —
create the practitioner here first, then reference their Practitioner Slug
(or just their Provider Slug, if they're the only one) wherever they need to
be credited.

## Sixth tab: "Homepage Hero Images"

Tab name must be exactly **"Homepage Hero Images"**. Each homepage visit
shows one active photo at random. Row 1 is headers, row 2 onward is data.
Wipe-and-recreate like FAQs: deleting a row, or setting Active to `N`,
removes that photo on the next sync. Until at least one row is active, the
homepage shows the Learn About ILIT field photo as a fallback.

| # | Column | Notes |
|---|--------|-------|
| A | Image URL | Required. Must be a `https://res.cloudinary.com/...` link (the site only loads images from Cloudinary; any other link is rejected by the sync and listed in its errors). Upload the full-size original; the site resizes it |
| B | Alt Text | Describe the photo for screen readers and search, e.g. `Woman planting flowers in a sunny garden`. Blank is allowed but not recommended |
| C | Active | `Y` / `N` — only `Y` rows are shown (blank counts as `N`) |

**Photo framing:** the hero is very wide and short, roughly 4:1 on desktop
and closer to 3:2 on phones, so photos are cropped to a horizontal band
through the middle. On desktop the search card covers the lower-left third.
Keep the subject centered or right of center, and use landscape photos at
least 2400px wide.
