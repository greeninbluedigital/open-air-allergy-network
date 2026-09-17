import { db } from "@/lib/db";
import { fetchSheetRows } from "@/lib/googleSheets";
import { geocodeAddress } from "@/lib/geocode";

// Column order for the "Providers" sheet tab, starting at row 2 (row 1 is
// headers). Deliberately excludes Stripe-managed fields (Subscription
// Status, Billing Reference, Next Billing Date — set by billing webhooks,
// not hand-entered) and Search Radius (derived from Geo-Extension, not a
// sheet input — see PROJECT_SPEC.md Section 4).
const COLUMNS = [
  "slug",
  "groupId",
  "practiceName",
  "address",
  "addressLine2",
  "city",
  "state",
  "zip",
  "phone",
  "website",
  "notificationEmail",
  "tier",
  "foundingMember",
  "geoExtension",
  "active",
  "verificationDate",
  "verificationNotes",
  "offersVideoConsult",
  "offersPhoneConsult",
  "shortBio",
  "extendedBio",
  "photoUrl",
  "secondaryPhotoUrls",
  "businessHours",
  "ilitScheduleNotes",
  "treatmentsOffered",
  "showReviews",
  "googlePlaceId",
  "yelpEmbedCode1",
  "yelpEmbedCode2",
  "yelpEmbedCode3",
  "yelpBusinessId",
  "yelpRatingBadgeEmbed",
  "customField1",
  "customField2",
  "notes",
  "isDemo",
] as const;

const SHEET_RANGE = "Providers!A2:AK";

// "Freemium" is the business's own term for this tier (bare listing, no
// other info, unverified) — accepted as a synonym alongside the original
// "Free/Claimed" spec wording. Patient-facing copy never shows either term
// (see the SRP page's BUCKET_LABELS) — it's jargon internal to how listings
// get managed, not something a patient needs to parse.
const TIER_MAP: Record<string, "FREE_CLAIMED" | "VERIFIED" | "FULL_PROFILE" | "FEATURED"> = {
  freemium: "FREE_CLAIMED",
  "free/claimed": "FREE_CLAIMED",
  free: "FREE_CLAIMED",
  claimed: "FREE_CLAIMED",
  verified: "VERIFIED",
  "full profile": "FULL_PROFILE",
  featured: "FEATURED",
};

function parseBool(cell: string | undefined): boolean {
  const v = (cell ?? "").trim().toLowerCase();
  return v === "y" || v === "yes" || v === "true" || v === "1";
}

function parseTier(cell: string | undefined): "FREE_CLAIMED" | "VERIFIED" | "FULL_PROFILE" | "FEATURED" {
  return TIER_MAP[(cell ?? "").trim().toLowerCase()] ?? "FREE_CLAIMED";
}

function parseDate(cell: string | undefined): Date | null {
  const v = (cell ?? "").trim();
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseList(cell: string | undefined): string[] {
  return (cell ?? "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseRow(row: string[]): Record<(typeof COLUMNS)[number], string> {
  const record = {} as Record<(typeof COLUMNS)[number], string>;
  COLUMNS.forEach((key, i) => {
    record[key] = row[i] ?? "";
  });
  return record;
}

async function syncTreatments(providerId: string, names: string[]) {
  const treatmentIds: string[] = [];
  for (const name of names) {
    const treatment = await db.treatment.upsert({
      where: { vertical_slug: { vertical: "ILIT/Allergy", slug: slugify(name) } },
      update: {},
      create: { vertical: "ILIT/Allergy", slug: slugify(name), name },
    });
    treatmentIds.push(treatment.id);
  }

  await db.$transaction([
    db.providerTreatment.deleteMany({ where: { providerId } }),
    ...treatmentIds.map((treatmentId) =>
      db.providerTreatment.create({ data: { providerId, treatmentId } }),
    ),
  ]);
}

export type SyncSummary = {
  created: number;
  updated: number;
  geocoded: number;
  skipped: number;
  errors: string[];
};

export async function runSync(): Promise<SyncSummary> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not set");

  const rawRows = await fetchSheetRows(spreadsheetId, SHEET_RANGE);
  const summary: SyncSummary = { created: 0, updated: 0, geocoded: 0, skipped: 0, errors: [] };

  for (const row of rawRows) {
    const r = parseRow(row);
    const slug = r.slug.trim();
    if (!slug) {
      summary.skipped++;
      continue;
    }

    try {
      const existing = await db.provider.findUnique({ where: { slug } });

      const addressChanged =
        !existing ||
        existing.address !== r.address ||
        existing.city !== r.city ||
        existing.state !== r.state ||
        existing.zip !== r.zip;

      let latitude = existing?.latitude ?? null;
      let longitude = existing?.longitude ?? null;
      if (addressChanged) {
        const geo = await geocodeAddress(r.address, r.city, r.state, r.zip);
        if (geo) {
          latitude = geo.lat;
          longitude = geo.lng;
          summary.geocoded++;
        }
      }

      const geoExtension = parseBool(r.geoExtension);

      const data = {
        groupId: r.groupId || null,
        practiceName: r.practiceName,
        address: r.address,
        addressLine2: r.addressLine2 || null,
        city: r.city,
        state: r.state,
        zip: r.zip,
        latitude,
        longitude,
        phone: r.phone || null,
        website: r.website || null,
        notificationEmail: r.notificationEmail || null,
        tier: parseTier(r.tier),
        foundingMember: parseBool(r.foundingMember),
        geoExtension,
        active: parseBool(r.active),
        verificationDate: parseDate(r.verificationDate),
        verificationNotes: r.verificationNotes || null,
        // Derived, not sheet-entered (Section 4).
        searchRadiusMiles: geoExtension ? 600 : 200,
        offersVideoConsult: parseBool(r.offersVideoConsult),
        offersPhoneConsult: parseBool(r.offersPhoneConsult),
        shortBio: r.shortBio || null,
        extendedBio: r.extendedBio || null,
        photoUrl: r.photoUrl || null,
        secondaryPhotoUrls: parseList(r.secondaryPhotoUrls).slice(0, 4),
        businessHours: r.businessHours || null,
        ilitScheduleNotes: r.ilitScheduleNotes || null,
        showReviews: parseBool(r.showReviews),
        googlePlaceId: r.googlePlaceId || null,
        yelpEmbedCode1: r.yelpEmbedCode1 || null,
        yelpEmbedCode2: r.yelpEmbedCode2 || null,
        yelpEmbedCode3: r.yelpEmbedCode3 || null,
        // Set now so /api/reviews/refresh can start populating a real Yelp
        // rating the moment YELP_API_KEY is added later — no sync change
        // needed at that point. yelpRating/yelpReviewCount are cron-managed,
        // not sheet inputs (see PROJECT_SPEC.md Section 4).
        yelpBusinessId: r.yelpBusinessId || null,
        yelpRatingBadgeEmbed: r.yelpRatingBadgeEmbed || null,
        customField1: r.customField1 || null,
        customField2: r.customField2 || null,
        internalNotes: r.notes || null,
        // Sales-demo listing (Section on the SRP/PDP/SEM demo-content
        // request) — excluded from SRP search + the sitemap, noindexed on
        // its own PDP. Appended as the sheet's last column rather than
        // inserted mid-layout, so every already-populated row's existing
        // columns keep their positions.
        isDemo: parseBool(r.isDemo),
      };

      const provider = await db.provider.upsert({
        where: { slug },
        create: { slug, ...data },
        update: data,
      });

      await syncTreatments(provider.id, parseList(r.treatmentsOffered));

      if (existing) {
        summary.updated++;
      } else {
        summary.created++;
      }
    } catch (err) {
      summary.errors.push(`${slug}: ${(err as Error).message}`);
    }
  }

  return summary;
}
