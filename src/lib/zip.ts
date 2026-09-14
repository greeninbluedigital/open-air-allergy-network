import zipcodes from "zipcodes";

/**
 * Offline US zip -> lat/lng centroid lookup for SRP/PAF radius search. This is
 * deliberately separate from the sync job's Mapbox geocoding of Provider
 * addresses (Section 2) — precise per-address geocoding needs a real
 * geocoder, but a bundled zip centroid table is accurate enough for "search
 * near this zip" and avoids an external API call on every search.
 */
export function lookupZip(zip: string): { lat: number; lng: number; city: string; state: string } | null {
  const entry = zipcodes.lookup(zip.trim());
  if (!entry) return null;
  return { lat: entry.latitude, lng: entry.longitude, city: entry.city, state: entry.state };
}
