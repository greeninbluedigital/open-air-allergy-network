import { readDb } from "@/lib/cache";
import { US_STATES } from "@/lib/states";
import type { SrpProvider } from "@/lib/srp";
import { streetName } from "@/lib/address";

/**
 * State pages (/find-an-ilit-provider/texas): every active practice in a
 * state, grouped by metro area, generated from the database so they never
 * go stale. Articles link here and to Find a Provider by zip instead of
 * listing practices themselves (owner's rule, 2026-10-13).
 */

export type StateInfo = { code: string; name: string; slug: string };

/** "North Carolina" -> "north-carolina". */
function slugify(name: string): string {
  return name.toLowerCase().normalize("NFKD").replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
}

/** The id of a metro's section on its state page, e.g. "dallas-fort-worth",
 * or "other" for the catch-all group. */
export function metroAnchor(metroName: string | null): string {
  return metroName ? slugify(metroName) : "other";
}

const STATES: StateInfo[] = US_STATES.map(([code, name]) => ({ code, name, slug: slugify(name) }));

export function stateBySlug(slug: string): StateInfo | null {
  return STATES.find((s) => s.slug === slug) ?? null;
}

export function stateByCode(code: string): StateInfo | null {
  return STATES.find((s) => s.code === code) ?? null;
}

export function statePath(code: string): string | null {
  const state = stateByCode(code);
  return state ? `/find-an-ilit-provider/${state.slug}` : null;
}

type Metro = {
  name: string;
  lat: number;
  lng: number;
  /** A central zip in this state, for the "Search near {metro}" link. */
  zip: string;
};

/** A practice joins the nearest metro within this distance. */
const METRO_RADIUS_MILES = 60;

/**
 * Metro areas by state, with center points. A practice outside every metro
 * listed for its state lands in "Other {State} locations", so a missing
 * metro is never an error: add one here when a state gets several
 * practices in a new area. Centers are the main city's downtown.
 */
const METROS: Record<string, Metro[]> = {
  AZ: [
    { name: "Phoenix", lat: 33.4484, lng: -112.074, zip: "85004" },
    { name: "Tucson", lat: 32.2226, lng: -110.9747, zip: "85701" },
    { name: "Yuma", lat: 32.6927, lng: -114.6277, zip: "85364" },
  ],
  CA: [
    { name: "Los Angeles", lat: 34.0522, lng: -118.2437, zip: "90012" },
    { name: "San Francisco Bay Area", lat: 37.8044, lng: -122.2712, zip: "94612" },
    { name: "San Diego", lat: 32.7157, lng: -117.1611, zip: "92101" },
    { name: "Sacramento", lat: 38.5816, lng: -121.4944, zip: "95814" },
  ],
  CO: [
    { name: "Denver", lat: 39.7392, lng: -104.9903, zip: "80202" },
    { name: "Colorado Springs", lat: 38.8339, lng: -104.8214, zip: "80903" },
  ],
  FL: [
    { name: "Tampa Bay", lat: 27.9506, lng: -82.4572, zip: "33602" },
    { name: "Orlando", lat: 28.5383, lng: -81.3792, zip: "32801" },
    { name: "South Florida", lat: 26.1224, lng: -80.1373, zip: "33301" },
    { name: "Jacksonville", lat: 30.3322, lng: -81.6557, zip: "32202" },
  ],
  IA: [{ name: "Des Moines", lat: 41.5868, lng: -93.625, zip: "50309" }],
  IL: [{ name: "Chicago", lat: 41.8781, lng: -87.6298, zip: "60601" }],
  KS: [
    { name: "Kansas City", lat: 39.0997, lng: -94.5786, zip: "66101" },
    { name: "Wichita", lat: 37.6872, lng: -97.3301, zip: "67202" },
  ],
  MI: [
    { name: "Grand Rapids", lat: 42.9634, lng: -85.6681, zip: "49503" },
    { name: "Detroit", lat: 42.3314, lng: -83.0458, zip: "48226" },
  ],
  MO: [
    { name: "St. Louis", lat: 38.627, lng: -90.1994, zip: "63101" },
    { name: "Kansas City", lat: 39.0997, lng: -94.5786, zip: "64106" },
  ],
  NC: [
    { name: "Charlotte", lat: 35.2271, lng: -80.8431, zip: "28202" },
    { name: "Raleigh", lat: 35.7796, lng: -78.6382, zip: "27601" },
  ],
  NM: [{ name: "Albuquerque", lat: 35.0844, lng: -106.6504, zip: "87102" }],
  OH: [
    { name: "Columbus", lat: 39.9612, lng: -82.9988, zip: "43215" },
    { name: "Cleveland", lat: 41.4993, lng: -81.6944, zip: "44113" },
    { name: "Cincinnati", lat: 39.1031, lng: -84.512, zip: "45202" },
  ],
  PA: [
    { name: "Philadelphia", lat: 39.9526, lng: -75.1652, zip: "19103" },
    { name: "Pittsburgh", lat: 40.4406, lng: -79.9959, zip: "15222" },
  ],
  TX: [
    { name: "Austin", lat: 30.2672, lng: -97.7431, zip: "78701" },
    { name: "Dallas–Fort Worth", lat: 32.7767, lng: -96.797, zip: "75201" },
    { name: "Houston", lat: 29.7604, lng: -95.3698, zip: "77002" },
    { name: "San Antonio", lat: 29.4241, lng: -98.4936, zip: "78205" },
    { name: "El Paso", lat: 31.7619, lng: -106.485, zip: "79901" },
    { name: "Midland–Odessa", lat: 31.9973, lng: -102.0779, zip: "79701" },
    { name: "Corpus Christi", lat: 27.8006, lng: -97.3964, zip: "78401" },
    { name: "Victoria", lat: 28.8053, lng: -97.0036, zip: "77901" },
    { name: "Waco", lat: 31.5493, lng: -97.1467, zip: "76701" },
    { name: "Killeen–Temple", lat: 31.1171, lng: -97.7278, zip: "76541" },
  ],
  VA: [
    { name: "Richmond", lat: 37.5407, lng: -77.436, zip: "23219" },
    { name: "Northern Virginia", lat: 38.8816, lng: -77.091, zip: "22201" },
    { name: "Hampton Roads", lat: 36.8508, lng: -76.2859, zip: "23510" },
  ],
  WV: [
    { name: "Huntington", lat: 38.4192, lng: -82.4452, zip: "25701" },
    { name: "Charleston", lat: 38.3498, lng: -81.6326, zip: "25301" },
  ],
};

function milesBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(h));
}

export type MetroGroup = {
  /** Null for the "Other {State} locations" group. */
  name: string | null;
  zip: string | null;
  providers: SrpProvider[];
};

const LIVE = { active: true, isDemo: false } as const;

const CARD_FIELDS = {
  id: true,
  slug: true,
  practiceName: true,
  city: true,
  state: true,
  latitude: true,
  longitude: true,
  tier: true,
  foundingMember: true,
  academic: true,
  geoExtension: true,
  travelNotes: true,
  photoUrl: true,
  srpPhotoUrl: true,
  pdpRemoteConsultBadge: true,
  customMessage: true,
  verificationDate: true,
  address: true,
} as const;

type CardRow = Awaited<ReturnType<typeof cardRows>>[number];

function cardRows(where: { state?: string }) {
  return readDb.provider.findMany({ where: { ...LIVE, ...where }, select: CARD_FIELDS });
}

/** Whether any live listing in the state is an "Allergy Clinic" (Practice
 * Type), so its title and H1 say "ILIT Allergists & Allergy Clinics". */
export async function stateHasClinic(code: string): Promise<boolean> {
  return (await readDb.provider.count({ where: { ...LIVE, state: code, practiceType: "Allergy Clinic" } })) > 0;
}

/** The state's practices grouped by metro: biggest metros first, then
 * "Other", each group sorted by city then name. Empty when the state has
 * no active practices (the page then 404s). */
export async function stateMetroGroups(code: string): Promise<MetroGroup[]> {
  return groupByMetro(code, await cardRows({ state: code }));
}

/** Every state with practices, A to Z, each with its metro groups. One
 * query, for the "ILIT Providers by State" page. */
export async function allStateMetroGroups(): Promise<{ state: StateInfo; groups: MetroGroup[] }[]> {
  const rows = await cardRows({});
  const byState = new Map<string, CardRow[]>();
  for (const row of rows) byState.set(row.state, [...(byState.get(row.state) ?? []), row]);
  return [...byState.entries()]
    .map(([code, stateRows]) => ({ state: stateByCode(code), groups: groupByMetro(code, stateRows) }))
    .filter((s): s is { state: StateInfo; groups: MetroGroup[] } => s.state !== null)
    .sort((a, b) => a.state.name.localeCompare(b.state.name));
}

function groupByMetro(code: string, rows: CardRow[]): MetroGroup[] {
  const metros = METROS[code] ?? [];
  const groups = new Map<string, MetroGroup>();
  const other: MetroGroup = { name: null, zip: null, providers: [] };
  // Same practice, same city: show each office's street on its card.
  const placeKey = (r: CardRow) => `${r.practiceName}|${r.city}`;
  const perPlace = new Map<string, number>();
  for (const r of rows) perPlace.set(placeKey(r), (perPlace.get(placeKey(r)) ?? 0) + 1);

  for (const { address, ...row } of rows) {
    const street = (perPlace.get(placeKey({ ...row, address })) ?? 0) > 1 ? streetName(address) : null;
    if (row.latitude == null || row.longitude == null) {
      other.providers.push({ ...row, street, latitude: 0, longitude: 0, distanceMiles: 0 });
      continue;
    }
    const point = { lat: row.latitude, lng: row.longitude };
    let best: { metro: Metro; miles: number } | null = null;
    for (const metro of metros) {
      const miles = milesBetween(point, metro);
      if (miles <= METRO_RADIUS_MILES && (!best || miles < best.miles)) best = { metro, miles };
    }
    const card: SrpProvider = { ...row, street, latitude: row.latitude, longitude: row.longitude, distanceMiles: best?.miles ?? 0 };
    if (!best) {
      other.providers.push(card);
      continue;
    }
    const group = groups.get(best.metro.name) ?? { name: best.metro.name, zip: best.metro.zip, providers: [] };
    group.providers.push(card);
    groups.set(best.metro.name, group);
  }

  const byPlace = (a: SrpProvider, b: SrpProvider) =>
    a.city.localeCompare(b.city) || a.practiceName.localeCompare(b.practiceName);
  const sorted = [...groups.values()].sort((a, b) => b.providers.length - a.providers.length || a.name!.localeCompare(b.name!));
  for (const g of [...sorted, other]) g.providers.sort(byPlace);
  return other.providers.length > 0 ? [...sorted, other] : sorted;
}

/** States with at least one active practice, with counts, A to Z. For the
 * "Browse by state" links and the sitemap. */
export async function statesWithProviders(): Promise<(StateInfo & { count: number })[]> {
  const rows = await readDb.provider.groupBy({ by: ["state"], where: LIVE, _count: true });
  return rows
    .map((r) => {
      const state = stateByCode(r.state);
      return state ? { ...state, count: r._count } : null;
    })
    .filter((s): s is StateInfo & { count: number } => s !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}
