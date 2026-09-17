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
  geoExtension: boolean;
  photoUrl: string | null;
  distanceMiles: number;
};

export type SrpBucket = "premium" | "verified" | "free";

export type SrpResult = {
  buckets: Record<SrpBucket, SrpProvider[]>;
  /** null in the normal cascade; set once we've widened past 200mi. */
  mode: "normal" | "extended-geo" | "extended-any" | "none";
  effectiveRadius: number;
  totalCount: number;
};

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
        "latitude", "longitude", "tier", "foundingMember", "geoExtension",
        "photoUrl",
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
    return {
      buckets: bucketize(rows),
      mode: "normal",
      effectiveRadius,
      totalCount: rows.length,
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
    };
  }

  return {
    buckets: { premium: [], verified: [], free: [] },
    mode: "none",
    effectiveRadius: 600,
    totalCount: 0,
  };
}
