# Engineering notes: built-but-unused, and how to build what's not there yet

## Future upgrades list

Not scheduled. Details for some are in the sections below.

- **Map pin clustering** (below): when dense metros have many practices.
- **Map "Search this area"** (below): probably never needed while ILIT
  providers are sparse.
- **SRP filter by treatment type** (below): the data is already there.
- **Data-driven badges** via the unused `ProviderBadge` table (below).
- **State and market-area hub pages** grouping practices, once there are
  enough phone-confirmed listings (planned 2026-09).
- **Practice report screen**: reporting data is collected
  (`docs/analytics.md`) but pulled by database query on request today.
- **Call tracking numbers**, so desktop phone calls (where the number is
  visible without a click) can be counted.
- **Paid Yelp API**: setting `YELP_API_KEY` turns on live Yelp ratings; the
  sheet fields are already in place.
- **Facebook reviews**: reserved fields exist; blocked on Meta app review.
- **Logo**: header and structured data, once designed (`docs/image-guide.md`).
- **House-call ("comes to you") providers** (designed 2026-10-07, build
  when a confirmed house-call ILIT provider signs up; first candidate Dr.
  Kara Wada, Central Ohio): sheet columns Service Mode (Office / House
  calls / Both) and Service Area text. House-call-only rows carry city,
  state and zip only (geocoded to the zip center, never a street). Search
  matches when the patient is inside the service radius; the card says
  "Comes to you" plus the area instead of miles and an address; the map
  draws a shaded service circle instead of a pin; the practice page drops
  the address and directions and adds a "House calls" badge; JSON-LD uses
  `areaServed` instead of an address. `Both` keeps today's behavior plus the badge.
- **Neon read replica for ad-hoc SQL**: a read-only compute on the
  production branch (free plan allows 3), so practice and analysis queries
  can't write. Until then, start SQL Editor sessions with
  `SET default_transaction_read_only = on;` (decided 2026-10-06).

## Map: pin clustering (planned)

At today's listing count, every pin is readable. Once a metro has enough
practices that pins overlap, group nearby pins into a numbered circle that
splits apart as you zoom in. The standard tool is the `leaflet.markercluster`
plugin: wrap the markers in `ProviderMap.tsx` in a cluster group instead of
adding them straight to the map. Things to keep when building it:
- Paid placement must still show: either keep Full Profile and Featured
  pins out of clusters, or color a cluster by the best tier inside it.
- The card-to-pin link (hover a card to enlarge its pin, open a pin to
  outline its card) needs the clustered pin revealed first
  (`zoomToShowLayer`).

## Map: "Search this area" (possible, probably not needed)

A button that appears after the visitor pans the map and reruns the search
for the visible area. It needs a bounds-based query alongside the
zip-and-radius one in `src/lib/srp.ts` (PostGIS can do it with
`ST_MakeEnvelope`). Only worth it if providers become dense enough that
people browse the map instead of searching a zip.

## `ProviderBadge` — exists in the schema, currently empty and unused

`prisma/schema.prisma` has a `ProviderBadge` model (`type`, `label`,
`expiresAt`) clearly meant to be a flexible, data-driven badge system. As of
2026-09-17 it has zero rows, and nothing in the app reads from it.

What's actually showing today (Founding Member, Verified, Sees Out-of-Area
Patients) are hardcoded booleans read directly off specific `Provider`
columns and rendered via `src/components/Badge.tsx`'s fixed `VARIANTS` map —
not this table.

**To actually use `ProviderBadge`** when the need for more flexible/varied
badges comes up (e.g. treatment-specific badges, seasonal promos):
1. Decide how rows get managed — Prisma Studio directly, or (if this needs
   to be practice-self-serve or sheet-managed) a new sheet tab, same pattern
   as the SEM Landing Pages tab.
2. Extend `Badge.tsx`'s `VARIANTS` map (or replace it with a lookup keyed by
   `ProviderBadge.type`) so an arbitrary `type` string maps to a color/style.
3. Query `provider.badges` wherever badges render (PDP, SRP cards, SEM hero)
   and filter for `expiresAt == null || expiresAt > now()` — the field
   already exists for time-limited badges (e.g. a promo), nothing reads it
   yet.

## SRP filter by treatment type — feasible now, not yet built

The data model already supports this with no schema change: `Treatment`
(canonical, `vertical` + `slug` + `name`) and `ProviderTreatment` (join
table) are populated today by `syncTreatments()` in `src/lib/sync.ts`,
splitting each provider's semicolon-separated "Treatments Offered" column
into individual rows.

**To build the actual filter:**
1. Add a filter control to the SRP page (`src/app/(site)/find-an-ilit-provider/page.tsx`)
   — a treatment dropdown/checkboxes, sourced from `db.treatment.findMany({ where: { vertical: "ILIT/Allergy" }, orderBy: { name: "asc" } })`.
2. Thread the selected treatment slug(s) through as a URL search param
   (same pattern as `zip`/`radius`/`view` today).
3. Extend `queryWithinRadius()` in `src/lib/srp.ts` — it's a raw SQL query
   (`$queryRaw`), so add a conditional `Prisma.sql` fragment (same pattern
   already used for `geoExtensionOnly`) joining `ProviderTreatment` and
   filtering by treatment id/slug.

**The one real design decision to make first**: if practices enter both a
branded/trademarked name and a standardized name in the same "Treatments
Offered" cell (e.g. `SkinAssure™; Patch Testing`), both become distinct,
independently-filterable `Treatment` rows — nothing wrong with that. But a
filter dropdown built by just listing every distinct `Treatment` name would
then show branded names mixed in with standardized ones, which is noisy for
a patient trying to filter. Two ways to handle it when the filter gets
built:
- Curate: add a `Treatment.isFilterable` (or similar) boolean the admin sets
  per row (Prisma Studio), and only show `isFilterable: true` treatments in
  the dropdown.
- Don't curate: accept the longer list. Only worth doing if the actual
  number of distinct treatment names stays small in practice.

Not decided yet — revisit when this filter actually gets built.
