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
  "srpPhotoUrl",
] as const;

const SHEET_RANGE = "Providers!A2:AL";

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

// Second sheet tab — one row per SEM landing page. A practice can have any
// number of these (one per target metro), keyed by (Provider Slug, URL
// Slug). Never deleted on sync, only upserted — same convention as the
// Providers tab: use the Active column to take one down rather than
// removing its row.
const SEM_LP_COLUMNS = [
  "providerSlug",
  "urlSlug",
  "targetMetroName",
  "travelNarrative",
  "active",
] as const;

const SEM_LP_SHEET_RANGE = "SEM Landing Pages!A2:E";

function parseSemLpRow(row: string[]): Record<(typeof SEM_LP_COLUMNS)[number], string> {
  const record = {} as Record<(typeof SEM_LP_COLUMNS)[number], string>;
  SEM_LP_COLUMNS.forEach((key, i) => {
    record[key] = row[i] ?? "";
  });
  return record;
}

export type LandingPageSyncSummary = {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
};

async function syncSemLandingPages(): Promise<LandingPageSyncSummary> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not set");

  const rawRows = await fetchSheetRows(spreadsheetId, SEM_LP_SHEET_RANGE);
  const summary: LandingPageSyncSummary = { created: 0, updated: 0, skipped: 0, errors: [] };

  for (const row of rawRows) {
    const r = parseSemLpRow(row);
    // Provider Slug must be explicit on every row — no fill-down. Removed
    // deliberately (2026-09): user wants a blank cell to fail obviously
    // (row skipped) rather than silently inherit a value from above.
    const providerSlug = r.providerSlug.trim();
    const urlSlug = r.urlSlug.trim();
    if (!providerSlug || !urlSlug) {
      summary.skipped++;
      continue;
    }

    try {
      const provider = await db.provider.findUnique({ where: { slug: providerSlug } });
      if (!provider) {
        summary.errors.push(`${providerSlug}/${urlSlug}: no provider with slug "${providerSlug}"`);
        continue;
      }

      const existing = await db.semLandingPage.findUnique({
        where: { providerId_urlSlug: { providerId: provider.id, urlSlug } },
      });

      await db.semLandingPage.upsert({
        where: { providerId_urlSlug: { providerId: provider.id, urlSlug } },
        create: {
          providerId: provider.id,
          urlSlug,
          targetMetroName: r.targetMetroName,
          travelNarrative: r.travelNarrative || null,
          active: parseBool(r.active),
        },
        update: {
          targetMetroName: r.targetMetroName,
          travelNarrative: r.travelNarrative || null,
          active: parseBool(r.active),
        },
      });

      if (existing) {
        summary.updated++;
      } else {
        summary.created++;
      }
    } catch (err) {
      summary.errors.push(`${providerSlug}/${urlSlug}: ${(err as Error).message}`);
    }
  }

  return summary;
}

// Fifth sheet tab — one row per practitioner (person), not per provider.
// Separate table, not a field on Providers, because a practice can have more
// than one credited practitioner and a practitioner can be affiliated with
// more than one location — this is the Author/AuthorProvider models'
// existing many-to-many shape, now sheet-managed instead of Prisma Studio.
// Upsert-by-key (Practitioner Slug), like Providers/SEM Landing Pages —
// editing Display Name or Bio just updates the row. Provider Slugs is
// reconciled to exactly match the sheet on every sync (add newly-listed
// affiliations, remove ones no longer listed), same edit/delete-friendly
// intent as the other tabs, without touching the Author record itself.
const PRACTITIONER_COLUMNS = ["practitionerSlug", "providerSlugs", "displayName", "bio"] as const;
const PRACTITIONER_SHEET_RANGE = "Practitioners!A2:D";

function parsePractitionerRow(row: string[]): Record<(typeof PRACTITIONER_COLUMNS)[number], string> {
  const record = {} as Record<(typeof PRACTITIONER_COLUMNS)[number], string>;
  PRACTITIONER_COLUMNS.forEach((key, i) => {
    record[key] = row[i] ?? "";
  });
  return record;
}

export type PractitionerSyncSummary = {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
};

async function syncPractitioners(): Promise<PractitionerSyncSummary> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not set");

  const rawRows = await fetchSheetRows(spreadsheetId, PRACTITIONER_SHEET_RANGE);
  const summary: PractitionerSyncSummary = { created: 0, updated: 0, skipped: 0, errors: [] };

  for (const row of rawRows) {
    const r = parsePractitionerRow(row);
    const slug = r.practitionerSlug.trim();
    const displayName = r.displayName.trim();
    const providerSlugs = parseList(r.providerSlugs);
    if (!slug || !displayName || providerSlugs.length === 0) {
      summary.skipped++;
      continue;
    }

    try {
      const existing = await db.author.findUnique({ where: { slug } });

      const author = await db.author.upsert({
        where: { slug },
        create: { slug, name: displayName, bio: r.bio || null },
        update: { name: displayName, bio: r.bio || null },
      });

      const matchedProviderIds: string[] = [];
      for (const providerSlug of providerSlugs) {
        const provider = await db.provider.findUnique({ where: { slug: providerSlug } });
        if (!provider) {
          summary.errors.push(`${slug}: no provider with slug "${providerSlug}"`);
          continue;
        }
        matchedProviderIds.push(provider.id);
      }

      await db.authorProvider.deleteMany({
        where: { authorId: author.id, providerId: { notIn: matchedProviderIds } },
      });
      for (const providerId of matchedProviderIds) {
        await db.authorProvider.upsert({
          where: { authorId_providerId: { authorId: author.id, providerId } },
          create: { authorId: author.id, providerId },
          update: {},
        });
      }

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

// Third sheet tab — one row per FAQ. Unlike Providers/SEM Landing Pages,
// this is deliberately wipe-and-recreate per provider (same pattern as
// syncTreatments above), not upsert-by-key: a question has no natural
// stable identity the way a URL slug does, so editing a question's wording
// would look like a brand-new FAQ under an upsert-by-key scheme, and
// deleting a sheet row would never delete anything. Wiping and recreating
// each mentioned provider's full FAQ set every sync means editing or
// deleting a row in the sheet behaves exactly as expected.
const FAQ_COLUMNS = ["providerSlug", "question", "answer", "sortOrder"] as const;
const FAQ_SHEET_RANGE = "FAQs!A2:D";

function parseFaqRow(row: string[]): Record<(typeof FAQ_COLUMNS)[number], string> {
  const record = {} as Record<(typeof FAQ_COLUMNS)[number], string>;
  FAQ_COLUMNS.forEach((key, i) => {
    record[key] = row[i] ?? "";
  });
  return record;
}

export type FaqSyncSummary = {
  providersUpdated: number;
  itemsSynced: number;
  skipped: number;
  errors: string[];
};

async function syncFaqs(): Promise<FaqSyncSummary> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not set");

  const rawRows = await fetchSheetRows(spreadsheetId, FAQ_SHEET_RANGE);
  const summary: FaqSyncSummary = { providersUpdated: 0, itemsSynced: 0, skipped: 0, errors: [] };

  // Group by provider slug first — sheet row order is the fallback sort
  // order when the Sort Order column is left blank. Provider Slug must be
  // explicit on every row — no fill-down (removed deliberately, 2026-09:
  // user wants a blank cell to fail obviously, i.e. the row skipped,
  // rather than silently inherit a value from above).
  const byProvider = new Map<string, { question: string; answer: string; sortOrder: number }[]>();
  rawRows.forEach((row, i) => {
    const r = parseFaqRow(row);
    const providerSlug = r.providerSlug.trim();
    const question = r.question.trim();
    const answer = r.answer.trim();
    if (!providerSlug || !question || !answer) {
      summary.skipped++;
      return;
    }
    const parsedSortOrder = Number.parseInt(r.sortOrder.trim(), 10);
    const sortOrder = Number.isFinite(parsedSortOrder) ? parsedSortOrder : i;
    const list = byProvider.get(providerSlug) ?? [];
    list.push({ question, answer, sortOrder });
    byProvider.set(providerSlug, list);
  });

  for (const [providerSlug, items] of byProvider) {
    try {
      const provider = await db.provider.findUnique({ where: { slug: providerSlug } });
      if (!provider) {
        summary.errors.push(`${providerSlug}: no provider with slug "${providerSlug}"`);
        continue;
      }

      await db.$transaction([
        db.providerFaqItem.deleteMany({ where: { providerId: provider.id } }),
        ...items.map((item) =>
          db.providerFaqItem.create({
            data: {
              providerId: provider.id,
              question: item.question,
              answer: item.answer,
              sortOrder: item.sortOrder,
            },
          }),
        ),
      ]);

      summary.providersUpdated++;
      summary.itemsSynced += items.length;
    } catch (err) {
      summary.errors.push(`${providerSlug}: ${(err as Error).message}`);
    }
  }

  return summary;
}

// Fourth sheet tab — assigns/approves the "Medically reviewed by" credit on
// /learn-about-ilit/[slug] cluster pages (Article.section = LEARN). Deliberately
// separate from the Blog's "Contributed by" (Article.authorId/providerCreditedId
// set directly, ungated) — this credit only renders when Approved is TRUE,
// so a page can be staged before there's documented sign-off, and pulled
// instantly (next sync) if a Featured subscription lapses, without deleting
// the underlying links. See docs/blog-content-guide.md.
const LEARN_CREDIT_COLUMNS = ["pageSlug", "providerSlug", "practitionerSlug", "approved", "notes"] as const;
const LEARN_CREDIT_SHEET_RANGE = "Learn Page Credits!A2:E";

function parseLearnCreditRow(row: string[]): Record<(typeof LEARN_CREDIT_COLUMNS)[number], string> {
  const record = {} as Record<(typeof LEARN_CREDIT_COLUMNS)[number], string>;
  LEARN_CREDIT_COLUMNS.forEach((key, i) => {
    record[key] = row[i] ?? "";
  });
  return record;
}

export type LearnCreditSyncSummary = {
  updated: number;
  unchanged: number;
  cleared: number;
  skipped: number;
  errors: string[];
};

async function syncLearnPageCredits(): Promise<LearnCreditSyncSummary> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not set");

  const rawRows = await fetchSheetRows(spreadsheetId, LEARN_CREDIT_SHEET_RANGE);
  const summary: LearnCreditSyncSummary = { updated: 0, unchanged: 0, cleared: 0, skipped: 0, errors: [] };
  const mentionedPageSlugs = new Set<string>();

  for (const row of rawRows) {
    const r = parseLearnCreditRow(row);
    const pageSlug = r.pageSlug.trim();
    const providerSlug = r.providerSlug.trim();
    if (!pageSlug || !providerSlug) {
      summary.skipped++;
      continue;
    }
    mentionedPageSlugs.add(pageSlug);

    try {
      const article = await db.article.findUnique({ where: { slug: pageSlug, section: "LEARN" } });
      if (!article) {
        summary.errors.push(`${pageSlug}: no LEARN-section article with this slug (create it first)`);
        continue;
      }

      const provider = await db.provider.findUnique({ where: { slug: providerSlug } });
      if (!provider) {
        summary.errors.push(`${pageSlug}: no provider with slug "${providerSlug}"`);
        continue;
      }

      // Practitioner Slug is optional — most providers have exactly one
      // linked practitioner today, so falling back to "whichever is linked"
      // covers that case without requiring the column. Once a provider has
      // more than one (the Practitioners tab supports this directly), the
      // sheet editor specifies which one by slug.
      const practitionerSlug = r.practitionerSlug.trim();
      const authorLink = practitionerSlug
        ? await db.authorProvider.findFirst({
            where: { providerId: provider.id, author: { slug: practitionerSlug } },
          })
        : await db.authorProvider.findFirst({ where: { providerId: provider.id } });
      if (!authorLink) {
        summary.errors.push(
          practitionerSlug
            ? `${pageSlug}: practitioner "${practitionerSlug}" isn't linked to provider "${providerSlug}" (check the Practitioners tab)`
            : `${pageSlug}: provider "${providerSlug}" has no linked practitioner yet (add one on the Practitioners tab)`,
        );
        continue;
      }

      const approved = parseBool(r.approved);
      const changed =
        article.authorId !== authorLink.authorId ||
        article.providerCreditedId !== provider.id ||
        article.reviewApproved !== approved;

      if (changed) {
        // Only touch the row when something real changed — lastUpdated is
        // @updatedAt and drives the visible "Last reviewed" date, so an
        // unconditional write on every sync would make it creep forward
        // even when nothing was actually reviewed.
        await db.article.update({
          where: { id: article.id },
          data: { authorId: authorLink.authorId, providerCreditedId: provider.id, reviewApproved: approved },
        });
        summary.updated++;
      } else {
        summary.unchanged++;
      }
    } catch (err) {
      summary.errors.push(`${pageSlug}: ${(err as Error).message}`);
    }
  }

  // Any LEARN article not mentioned in this sync pass loses its approval —
  // deleting/blanking a sheet row is how a credit gets turned off (e.g. a
  // Featured subscription lapses), same intuitive edit/delete behavior as
  // the other secondary tabs, without destroying the staged author/provider
  // links in case the same practice gets re-approved later.
  const toClear = await db.article.findMany({
    where: { section: "LEARN", reviewApproved: true, slug: { notIn: [...mentionedPageSlugs] } },
    select: { id: true },
  });
  for (const { id } of toClear) {
    await db.article.update({ where: { id }, data: { reviewApproved: false } });
    summary.cleared++;
  }

  return summary;
}

// Fifth tab — homepage hero photos. Wipe-and-recreate like FAQs, so deleting
// a row (or setting Active to N) removes that photo on the next sync. If the
// tab is missing, fetchSheetRows throws before anything is deleted.
const HERO_COLUMNS = ["imageUrl", "altText", "active"] as const;
const HERO_SHEET_RANGE = "Homepage Hero Images!A2:C";

export type HeroImageSyncSummary = { synced: number; skipped: number; errors: string[] };

async function syncHomepageHeroImages(): Promise<HeroImageSyncSummary> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not set");

  const rawRows = await fetchSheetRows(spreadsheetId, HERO_SHEET_RANGE);
  const summary: HeroImageSyncSummary = { synced: 0, skipped: 0, errors: [] };

  const images: { imageUrl: string; altText: string; sortOrder: number }[] = [];
  rawRows.forEach((row, i) => {
    const r = {} as Record<(typeof HERO_COLUMNS)[number], string>;
    HERO_COLUMNS.forEach((key, c) => {
      r[key] = (row[c] ?? "").trim();
    });
    if (!r.imageUrl || !parseBool(r.active)) {
      summary.skipped++;
      return;
    }
    if (!/^https:\/\/res\.cloudinary\.com\//.test(r.imageUrl)) {
      summary.errors.push(`Row ${i + 2}: Image URL must be a res.cloudinary.com link`);
      return;
    }
    images.push({ imageUrl: r.imageUrl, altText: r.altText, sortOrder: i });
  });

  await db.$transaction([
    db.homepageHeroImage.deleteMany(),
    ...images.map((data) => db.homepageHeroImage.create({ data })),
  ]);
  summary.synced = images.length;
  return summary;
}

export type SyncSummary = {
  created: number;
  updated: number;
  geocoded: number;
  skipped: number;
  errors: string[];
  landingPages: LandingPageSyncSummary;
  faqs: FaqSyncSummary;
  practitioners: PractitionerSyncSummary;
  learnCredits: LearnCreditSyncSummary;
  heroImages: HeroImageSyncSummary;
};

export async function runSync(): Promise<SyncSummary> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not set");

  const rawRows = await fetchSheetRows(spreadsheetId, SHEET_RANGE);
  const summary: SyncSummary = {
    created: 0,
    updated: 0,
    geocoded: 0,
    skipped: 0,
    errors: [],
    landingPages: { created: 0, updated: 0, skipped: 0, errors: [] },
    faqs: { providersUpdated: 0, itemsSynced: 0, skipped: 0, errors: [] },
    practitioners: { created: 0, updated: 0, skipped: 0, errors: [] },
    learnCredits: { updated: 0, unchanged: 0, cleared: 0, skipped: 0, errors: [] },
    heroImages: { synced: 0, skipped: 0, errors: [] },
  };

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
      const active = parseBool(r.active);

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
        active,
        verificationDate: parseDate(r.verificationDate),
        verificationNotes: r.verificationNotes || null,
        // Distinct from verificationDate (see schema comment) — bumped to
        // today whenever Active, omitted entirely otherwise so Prisma's
        // upsert leaves the existing stored value untouched rather than
        // clearing or freezing it via an explicit no-op write. The kill
        // switch this checks (`active`) is the same one that already drives
        // SRP visibility; swap to real Stripe subscription status here too
        // once that's wired in.
        ...(active ? { verifiedAsOf: new Date() } : {}),
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
        // Deliberately separate from photoUrl — see the schema comment on
        // Provider.srpPhotoUrl for why a shared image doesn't work well
        // across the PDP's portrait layout and the SRP card's square one.
        srpPhotoUrl: r.srpPhotoUrl || null,
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

  // A missing sheet tab (or any other failure in either of these) must
  // never take down the provider sync above, which already succeeded.
  try {
    summary.landingPages = await syncSemLandingPages();
  } catch (err) {
    summary.landingPages.errors.push((err as Error).message);
  }

  try {
    summary.faqs = await syncFaqs();
  } catch (err) {
    summary.faqs.errors.push((err as Error).message);
  }

  // Must run before learnCredits — it resolves practitioner links that a
  // newly-added row on the Learn Page Credits tab may depend on this run.
  try {
    summary.practitioners = await syncPractitioners();
  } catch (err) {
    summary.practitioners.errors.push((err as Error).message);
  }

  try {
    summary.learnCredits = await syncLearnPageCredits();
  } catch (err) {
    summary.learnCredits.errors.push((err as Error).message);
  }

  try {
    summary.heroImages = await syncHomepageHeroImages();
  } catch (err) {
    summary.heroImages.errors.push((err as Error).message);
  }

  return summary;
}
