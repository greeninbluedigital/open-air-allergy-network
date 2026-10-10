import { cookies, headers } from "next/headers";
import { ZIP_COOKIE, lookupZip } from "@/lib/zip";
import { isHealthDataState } from "@/lib/healthDataStates";

/** The visitor's state two ways: Vercel's IP geolocation (US visitors only;
 * absent in local dev) and the zip they last searched. */
export async function visitorRegion(): Promise<{ ipRegion: string | null; zipState: string | null }> {
  const h = await headers();
  const ipRegion = h.get("x-vercel-ip-country") === "US" ? h.get("x-vercel-ip-country-region") : null;
  const savedZip = (await cookies()).get(ZIP_COOKIE)?.value;
  const zipState = savedZip ? (lookupZip(savedZip)?.state ?? null) : null;
  return { ipRegion, zipState };
}

/** True when either signal puts the visitor in a consumer health data state
 * (healthDataStates.ts), so their page gets the email button, not the form. */
export async function visitorInHealthDataState(): Promise<boolean> {
  const { ipRegion, zipState } = await visitorRegion();
  return isHealthDataState(ipRegion) || isHealthDataState(zipState);
}

export type VisitorLocation = {
  lat: number;
  lng: number;
  city: string;
  /** Present when known; used to link to a matching provider search. */
  zip?: string;
  /** "zip" = a zip the visitor typed (accurate); "ip" = Vercel's approximate location. */
  source: "zip" | "ip";
};

/** Saved zip first, then Vercel's IP geolocation headers (US only, absent in local dev). */
export async function getVisitorLocation(): Promise<VisitorLocation | null> {
  const savedZip = (await cookies()).get(ZIP_COOKIE)?.value;
  const fromZip = savedZip ? lookupZip(savedZip) : null;
  if (savedZip && fromZip) {
    return { lat: fromZip.lat, lng: fromZip.lng, city: fromZip.city, zip: savedZip, source: "zip" };
  }

  const h = await headers();
  const latHeader = h.get("x-vercel-ip-latitude");
  const lngHeader = h.get("x-vercel-ip-longitude");
  const cityHeader = h.get("x-vercel-ip-city");
  if (h.get("x-vercel-ip-country") !== "US" || !latHeader || !lngHeader || !cityHeader) return null;

  const lat = Number(latHeader);
  const lng = Number(lngHeader);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    lat,
    lng,
    city: decodeURIComponent(cityHeader),
    zip: h.get("x-vercel-ip-postal-code") || undefined,
    source: "ip",
  };
}
