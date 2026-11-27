import type { Prisma } from "@/generated/prisma/client";
import { readDb } from "@/lib/cache";
import { SHOWN_CREDIT } from "@/lib/credits";
import { providerIdsWithinRadius } from "@/lib/nearbyProviders";
import { milesBetween } from "@/lib/srp";
import { metroAnchor, metroByName, stateByCode, stateMetroGroups } from "@/lib/statePages";
import { lookupZip } from "@/lib/zip";
import { SEASONAL_GUIDE_SLUG } from "@/lib/content";

/**
 * Region-focused house articles (owner, 2026-11-27): which place each one is
 * about, so visitors can find the guide for where they live. One list feeds
 * the Blog's zip filter and "Allergy guides for your area" row, the state
 * pages' guide list, the line under Find a Provider results, and the
 * "Find an allergy clinic in …" link at the top of each article.
 *
 * Add a row when a regional article publishes (docs/content-pipeline.md).
 * A row for an unpublished slug is harmless: every query only reads
 * PUBLISHED articles. Contributed (practice-credited) articles stay off this
 * list, so a practice's own article never points readers at other clinics;
 * they still join the guide lists by their practice's location (below).
 *
 * A place is a metro from src/lib/statePages.ts (state + metro), a city
 * outside those metros (state + label + lat/lng), or a whole state (state
 * only, matched by the visitor's state).
 */
export type RegionPlace = {
  state: string;
  metro?: string;
  label?: string;
  lat?: number;
  lng?: number;
};

export const REGIONAL_ARTICLES: Record<string, RegionPlace[]> = {
  "austin-allergies": [{ state: "TX", metro: "Austin" }],
  "dallas-fort-worth-allergies": [{ state: "TX", metro: "Dallas–Fort Worth" }],
  "houston-allergies": [{ state: "TX", metro: "Houston" }],
  "los-angeles-allergies": [{ state: "CA", metro: "Los Angeles" }],
  "orlando-allergies": [{ state: "FL", metro: "Orlando" }],
  "tampa-bay-allergy-triggers": [{ state: "FL", metro: "Tampa Bay" }],
  "allergy-proof-home-tampa-bay": [{ state: "FL", metro: "Tampa Bay" }],
  "toledo-allergies": [{ state: "OH", label: "Toledo", lat: 41.6528, lng: -83.5379 }],
  "michigan-allergy-season": [{ state: "MI" }],
  "michigan-basement-mold-allergy": [{ state: "MI" }],
  // Kansas City links to the Kansas page (its practices are in Kansas).
  "st-louis-kansas-city-allergy-triggers": [
    { state: "KS", metro: "Kansas City" },
    { state: "MO", metro: "St. Louis" },
  ],
  "denver-colorado-springs-allergies": [
    { state: "CO", metro: "Denver" },
    { state: "CO", metro: "Colorado Springs" },
  ],
};

/** Visitors within this many miles of a city or metro center match it. */
export const REGION_RADIUS_MILES = 60;

/** The place's display name: "Houston", "Toledo", or the state's name. */
export function placeName(place: RegionPlace): string {
  return place.metro ?? place.label ?? stateByCode(place.state)?.name ?? place.state;
}

function placePoint(place: RegionPlace): { lat: number; lng: number } | null {
  if (place.lat != null && place.lng != null) return { lat: place.lat, lng: place.lng };
  if (place.metro) {
    const m = metroByName(place.state, place.metro);
    return m ? { lat: m.lat, lng: m.lng } : null;
  }
  return null;
}

/** How far a visitor is from a place: miles for a city or metro, 0 inside a
 * whole-state place's state, null when it doesn't match. */
function placeDistance(place: RegionPlace, loc: { lat: number; lng: number; state: string }, radius: number): number | null {
  const point = placePoint(place);
  if (!point) return place.state === loc.state ? REGION_RADIUS_MILES : null;
  const miles = milesBetween(loc.lat, loc.lng, point.lat, point.lng);
  return miles <= radius ? miles : null;
}

/** Regional article slugs that match a location, nearest first. */
export function regionalSlugsNear(loc: { lat: number; lng: number; state: string }, radius = REGION_RADIUS_MILES): string[] {
  const hits: { slug: string; miles: number }[] = [];
  for (const [slug, places] of Object.entries(REGIONAL_ARTICLES)) {
    const best = Math.min(...places.map((p) => placeDistance(p, loc, radius) ?? Infinity));
    if (best !== Infinity) hits.push({ slug, miles: best });
  }
  return hits.sort((a, b) => a.miles - b.miles).map((h) => h.slug);
}

/** Regional article slugs with any place in the state. */
export function regionalSlugsInState(code: string): string[] {
  return Object.entries(REGIONAL_ARTICLES)
    .filter(([, places]) => places.some((p) => p.state === code))
    .map(([slug]) => slug);
}

/** Every regional slug, for excluding faraway guides from a zip filter. */
export const REGIONAL_SLUGS = Object.keys(REGIONAL_ARTICLES);

/** Published articles for these slugs, kept in the given order. */
export async function publishedInOrder(slugs: string[]) {
  if (slugs.length === 0) return [];
  const rows = await readDb.article.findMany({
    where: { slug: { in: slugs }, status: "PUBLISHED" },
    include: { author: true },
  });
  return slugs.map((s) => rows.find((r) => r.slug === s)).filter((r) => r != null);
}

const CREDITED_FEED = {
  status: "PUBLISHED",
  section: { in: ["BLOG", "LEARN"] },
  ...SHOWN_CREDIT,
} satisfies Prisma.ArticleWhereInput;

/** Articles credited to practices near a point (only credits that show),
 * newest first: a practice's own article is as local as a city guide
 * (owner, 2026-11-27). */
async function creditedNear(lat: number, lng: number, radius: number) {
  const ids = await providerIdsWithinRadius(lat, lng, radius);
  if (ids.length === 0) return [];
  return readDb.article.findMany({
    where: { ...CREDITED_FEED, providerCreditedId: { in: ids } },
    orderBy: { publishedDate: "desc" },
    include: { author: true },
  });
}

/** Articles credited to live practices in a state, newest first. */
export async function creditedInState(code: string) {
  return readDb.article.findMany({
    where: { ...CREDITED_FEED, providerCredited: { state: code, active: true, isDemo: false } },
    orderBy: { publishedDate: "desc" },
    include: { author: true },
  });
}

/** A state's guides: its regional house guides, then articles credited to
 * its practices (the state page's "Allergy guides for {State}"). */
export async function guidesInState(code: string) {
  const [regional, credited] = await Promise.all([publishedInOrder(regionalSlugsInState(code)), creditedInState(code)]);
  return [...regional, ...credited.filter((c) => !regional.some((r) => r.id === c.id))];
}

/**
 * The guides to show a visitor for a zip: regional guides and practice-
 * credited articles near them, else the same for their state, else (when
 * `fallback` is on) the national seasonal guide. Never an empty "nothing
 * near you" message, which would hint at which regions OAAN covers.
 * `credited: false` keeps it to house guides (the line under Find a
 * Provider results is about allergy season).
 */
export async function guidesForZip(zip: string, { limit = 3, fallback = true, credited = true } = {}) {
  const loc = lookupZip(zip);
  if (!loc) return { kind: "none" as const, articles: [] };
  const [regionalNear, creditedHere] = await Promise.all([
    publishedInOrder(regionalSlugsNear(loc)),
    credited ? creditedNear(loc.lat, loc.lng, REGION_RADIUS_MILES) : [],
  ]);
  const near = [...regionalNear, ...creditedHere];
  if (near.length > 0) return { kind: "near" as const, articles: near.slice(0, limit) };
  const inState = credited ? await guidesInState(loc.state) : await publishedInOrder(regionalSlugsInState(loc.state));
  if (inState.length > 0)
    return { kind: "state" as const, stateName: stateByCode(loc.state)?.name, articles: inState.slice(0, limit) };
  if (!fallback) return { kind: "none" as const, articles: [] };
  return { kind: "national" as const, articles: await publishedInOrder([SEASONAL_GUIDE_SLUG]) };
}

/** "Find an allergy clinic in …" links for an article: one per place whose
 * state page exists, pointing at the metro's section when it has one. */
export async function clinicLinksFor(slug: string): Promise<{ name: string; href: string }[]> {
  const places = REGIONAL_ARTICLES[slug];
  if (!places) return [];
  const links = await Promise.all(
    places.map(async (place) => {
      const state = stateByCode(place.state);
      if (!state) return null;
      const groups = await stateMetroGroups(place.state);
      if (groups.length === 0) return null; // no state page (it 404s)
      // A metro with its own section gets its name and anchor; anything else
      // (a city outside the listed metros, a whole state, a metro with no
      // practices yet) links to the top of the state page under the state's
      // name, so the link says where it actually goes.
      const hasSection = Boolean(place.metro && groups.some((g) => g.name === place.metro));
      return hasSection
        ? { name: place.metro!, href: `/find-an-ilit-provider/${state.slug}#${metroAnchor(place.metro!)}` }
        : { name: state.name, href: `/find-an-ilit-provider/${state.slug}` };
    }),
  );
  return links.filter((l) => l != null);
}
