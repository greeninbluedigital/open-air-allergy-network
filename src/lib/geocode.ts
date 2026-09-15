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

  const data = (await res.json()) as { features?: { center: [number, number] }[] };
  const feature = data.features?.[0];
  if (!feature) return null;

  const [lng, lat] = feature.center;
  return { lat, lng };
}
