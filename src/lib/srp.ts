import { cachedQuery } from "@/lib/cache";
import { db } from "@/lib/db";
import { streetName } from "@/lib/address";

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
  travelNotes: string | null;
  photoUrl: string | null;
  srpPhotoUrl: string | null;
  pdpRemoteConsultBadge: boolean;
  customMessage: string | null;
  verificationDate: Date | null;
  /** The office's street (e.g. "Central Ave"), set only when the same
   * practice has another active office in the same city, so the two cards
   * don't look identical. */
  street: string | null;
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

/** Miles between two points (haversine on a mean-radius Earth; within about
 * 0.5% of PostGIS's spheroid distance, which is plenty for search radii). */
export function milesBetween(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 3958.7613 * Math.asin(Math.sqrt(a));
}

type LiveProvider = Omit<SrpProvider, "distanceMiles"> & { searchRadiusMiles: number };

/**
 * Every live listing with a location, as one cached list (src/lib/cache.ts).
 * Search, the homepage's nearby practices and practice pages' nearby box all
 * measure distances from this in code (2026-10-31), so a visitor's location
 * or a new zip never reaches the database. About 120 rows, so it's instant.
 */
function liveProviders(): Promise<LiveProvider[]> {
  return cachedQuery(["srp-live-providers"], async () => {
    const rows = await db.provider.findMany({
      where: { active: true, isDemo: false, latitude: { not: null }, longitude: { not: null } },
      select: {
        id: true, slug: true, practiceName: true, city: true, state: true, address: true,
        latitude: true, longitude: true, tier: true, foundingMember: true, academic: true,
        geoExtension: true, travelNotes: true, photoUrl: true, srpPhotoUrl: true,
        pdpRemoteConsultBadge: true, customMessage: true, verificationDate: true, searchRadiusMiles: true,
      },
    });
    return rows.map(({ address, latitude, longitude, ...p }) => {
      // Another live office with the same name in the same city, so the two
      // cards don't look identical.
      const hasSibling = rows.some(
        (o) => o.id !== p.id && o.practiceName === p.practiceName && o.city === p.city && o.state === p.state,
      );
      return { ...p, latitude: latitude!, longitude: longitude!, street: hasSibling ? streetName(address) : null };
    });
  });
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
  const rows: SrpProvider[] = [];
  for (const { searchRadiusMiles, ...p } of await liveProviders()) {
    const distanceMiles = milesBetween(lat, lng, p.latitude, p.longitude);
    if (distanceMiles > radiusMiles) continue;
    if (geoExtensionOnly && !p.geoExtension) continue;
    if (!ignoreOwnCap && distanceMiles > searchRadiusMiles) continue;
    rows.push({ ...p, distanceMiles });
  }
  return rows.sort((a, b) => a.distanceMiles - b.distanceMiles);
}

/**
 * Nearest listings to a point (a basic listing's own location, or a homepage
 * visitor's), whatever their listing level (a neutral site since
 * 2026-10-09), using the same eligibility rules as search: each listing only
 * appears within its own radius (200mi, or 600mi with Geo-Extension).
 */
export async function nearbyProviders(
  lat: number,
  lng: number,
  { excludeId, limit = 3 }: { excludeId?: string; limit?: number } = {},
): Promise<SrpProvider[]> {
  const rows = await queryWithinRadius(lat, lng, 600);
  return rows.filter((p) => p.id !== excludeId).slice(0, limit);
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
