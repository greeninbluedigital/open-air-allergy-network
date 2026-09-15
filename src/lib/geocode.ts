/**
 * Server-side address geocoding (Mapbox), used only by the sync job — distinct
 * from src/lib/zip.ts, which is an offline zip-centroid lookup for SRP/PAF
 * search and needs no API call. Only called when a Provider's address has
 * actually changed (see sync.ts), per PROJECT_SPEC.md Section 3.
 */
export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zip: string,
): Promise<{ lat: number; lng: number } | null> {
  const token = process.env.MAPBOX_TOKEN;
  if (!token) throw new Error("MAPBOX_TOKEN is not set");

  const query = `${address}, ${city}, ${state} ${zip}`;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1&country=us`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Mapbox geocoding failed (${res.status}) for "${query}"`);
  }

  const data = (await res.json()) as {
    features?: { center: [number, number]; relevance: number; place_name: string }[];
  };
  const feature = data.features?.[0];
  if (!feature) return null;

  // A real, well-formed address scores close to 1.0. A low score means Mapbox
  // couldn't actually find this address and is guessing from the closest
  // text match (seen in testing: a fake placeholder address matched a
  // same-named street on the other side of the country) — better to fail
  // loudly (caught and logged per-row by sync.ts) than silently write a
  // wrong lat/long that would place a practice hundreds of miles off.
  const RELEVANCE_THRESHOLD = 0.5;
  if (feature.relevance < RELEVANCE_THRESHOLD) {
    throw new Error(
      `Low-confidence geocode (${feature.relevance.toFixed(2)}) for "${query}" — closest match was "${feature.place_name}". Check the address.`,
    );
  }

  const [lng, lat] = feature.center;
  return { lat, lng };
}
