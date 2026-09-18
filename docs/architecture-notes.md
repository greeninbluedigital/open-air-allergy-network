# Engineering notes: built-but-unused, and how to build what's not there yet

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
