import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

export type SrpProvider = {
  id: string;
  slug: string;
  practiceName: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  tier: "FREE_CLAIMED" | "VERIFIED" | "FULL_PROFILE" | "FEATURED";
  foundingMember: boolean;
  academic: boolean;
  geoExtension: boolean;
  photoUrl: string | null;
  srpPhotoUrl: string | null;
  pdpRemoteConsultBadge: boolean;
  customMessage: string | null;
  verificationDate: Date | null;
  distanceMiles: number;
};

export type SrpBucket = "premium" | "verified" | "free";

export type SrpResult = {
  buckets: Record<SrpBucket, SrpProvider[]>;
  /** null in the normal cascade; set once we've widened past 200mi. */
  mode: "normal" | "extended-geo" | "extended-any" | "none";
  effectiveRadius: number;
  totalCount: number;
  /** Geo-Extension practices beyond the search radius (up to 600mi), shown
   * in their own section below the local results. Only filled in the normal
   * mode: when nothing is local, they're already the main results. */
  outOfArea: SrpProvider[];
};

/** How many out-of-area Geo-Extension practices a search shows. */
// A failsafe, not a design limit: the section sits at the bottom, and more
// choices let patients pick where they'd rather travel (2026-10-02).
const OUT_OF_AREA_LIMIT = 10;

// User-facing dropdown options — 200 is the hard UI ceiling (Section 4).
export const RADIUS_OPTIONS = [20, 30, 40, 50, 75, 100, 150, 200] as const;

// Auto-expand fallback steps when the chosen radius returns nothing.
const AUTO_EXPAND_STEPS = [10, 20, 30, 40, 50, 75, 100, 150, 200];

const MILES_PER_METER = 1 / 1609.344;

function bucketize(rows: SrpProvider[]): Record<SrpBucket, SrpProvider[]> {
  const buckets: Record<SrpBucket, SrpProvider[]> = {
    premium: [],
    verified: [],
    free: [],
  };
  for (const row of rows) {
    if (row.tier === "FULL_PROFILE" || row.tier === "FEATURED") {
      buckets.premium.push(row);
    } else if (row.tier === "VERIFIED") {
      buckets.verified.push(row);
    } else {
      buckets.free.push(row);
    }
  }
  // Each bucket is distance-sorted only — no cross-bucket tier priority.
  for (const bucket of Object.values(buckets)) {
    bucket.sort((a, b) => a.distanceMiles - b.distanceMiles);
  }
  return buckets;
}

/** Every active provider within `radiusMiles`, respecting each provider's own
 * searchRadiusMiles eligibility ceiling (200 normally, 600 for Geo-Extension) —
 * unless `ignoreOwnCap` is set, the fallback-only exception used once we've
 * confirmed nothing at all exists within 600mi under normal rules. */
async function queryWithinRadius(
  lat: number,
  lng: number,
  radiusMiles: number,
  { geoExtensionOnly = false, ignoreOwnCap = false } = {},
): Promise<SrpProvider[]> {
  const radiusMeters = radiusMiles / MILES_PER_METER;

  const rows = await db.$queryRaw<
    Array<Omit<SrpProvider, "distanceMiles"> & { distanceMeters: number }>
  >(
    Prisma.sql`
      SELECT
        "id", "slug", "practiceName", "city", "state",
        "latitude", "longitude", "tier", "foundingMember", "academic", "geoExtension",
        "photoUrl", "srpPhotoUrl", "pdpRemoteConsultBadge", "customMessage", "verificationDate",
        ST_Distance("geog", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) AS "distanceMeters"
      FROM "Provider"
      WHERE "active" = true
        AND "isDemo" = false
        AND "geog" IS NOT NULL
        AND ST_DWithin("geog", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusMeters})
        ${geoExtensionOnly ? Prisma.sql`AND "geoExtension" = true` : Prisma.empty}
        ${
          ignoreOwnCap
            ? Prisma.empty
            : Prisma.sql`AND ST_DWithin("geog", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, "searchRadiusMiles" * 1609.344)`
        }
      ORDER BY "distanceMeters" ASC
    `,
  );

  return rows.map((row) => ({
    ...row,
    distanceMiles: row.distanceMeters * MILES_PER_METER,
  }));
}

/**
 * Nearest Full Profile/Featured listings to a point (a Freemium PDP's own
 * location, or a homepage visitor's, where `featuredOnly` limits it to the
 * Featured tier: the homepage is reserved for it), using the same eligibility rules as
 * search: each listing only appears within its own radius (200mi, or 600mi
 * with Geo-Extension).
 */
export async function nearbyFeaturedProviders(
  lat: number,
  lng: number,
  {
    excludeId,
    limit = 3,
    featuredOnly = false,
  }: { excludeId?: string; limit?: number; featuredOnly?: boolean } = {},
): Promise<SrpProvider[]> {
  const rows = await queryWithinRadius(lat, lng, 600);
  return rows
    .filter(
      (p) => p.id !== excludeId && (p.tier === "FEATURED" || (!featuredOnly && p.tier === "FULL_PROFILE")),
    )
    .slice(0, limit);
}

/** How many listings a normal search from this point would show (200mi, each listing's own cap). */
export async function countProvidersNear(lat: number, lng: number, radiusMiles = 200): Promise<number> {
  return (await queryWithinRadius(lat, lng, radiusMiles)).length;
}

export async function searchProviders(
  lat: number,
  lng: number,
  chosenRadius: number,
): Promise<SrpResult> {
  // Step 1: normal search at the chosen radius.
  let rows = await queryWithinRadius(lat, lng, chosenRadius);
  let effectiveRadius = chosenRadius;

  // Auto-expand: if nothing at the chosen radius, widen step by step (still
  // capped at 200) to find the smallest radius with any results.
  if (rows.length === 0) {
    for (const step of AUTO_EXPAND_STEPS) {
      if (step <= chosenRadius) continue;
      rows = await queryWithinRadius(lat, lng, step);
      if (rows.length > 0) {
        effectiveRadius = step;
        break;
      }
    }
  }

  if (rows.length > 0) {
    // Out-of-area: Geo-Extension practices beyond the patient's own radius
    // but within their 600mi reach, nearest first.
    const local = new Set(rows.map((r) => r.id));
    const outOfArea = (await queryWithinRadius(lat, lng, 600, { geoExtensionOnly: true }))
      .filter((p) => !local.has(p.id) && p.distanceMiles > effectiveRadius)
      .slice(0, OUT_OF_AREA_LIMIT);
    return {
      buckets: bucketize(rows),
      mode: "normal",
      effectiveRadius,
      totalCount: rows.length,
      outOfArea,
    };
  }

  // Step 2: extended — widen to 600mi, Geo-Extension listings only first.
  rows = await queryWithinRadius(lat, lng, 600, { geoExtensionOnly: true });
  if (rows.length > 0) {
    return {
      buckets: bucketize(rows),
      mode: "extended-geo",
      effectiveRadius: 600,
      totalCount: rows.length,
      outOfArea: [],
    };
  }

  // Step 3: fallback-only exception — ignore every listing's own 200mi cap.
  rows = await queryWithinRadius(lat, lng, 600, { ignoreOwnCap: true });
  if (rows.length > 0) {
    return {
      buckets: bucketize(rows),
      mode: "extended-any",
      effectiveRadius: 600,
      totalCount: rows.length,
      outOfArea: [],
    };
  }

  return {
    buckets: { premium: [], verified: [], free: [] },
    mode: "none",
    effectiveRadius: 600,
    totalCount: 0,
    outOfArea: [],
  };
}
