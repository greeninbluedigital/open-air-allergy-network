import { cachedQuery } from "@/lib/cache";
import { db } from "@/lib/db";
import { milesBetween } from "@/lib/srp";

/** Provider IDs within `radiusMiles` of the given point — used to find
 * credited articles near a zip (the Blog's zip filter and its "Allergy
 * guides for your area" row). Measured in code from one cached list (like
 * search, src/lib/srp.ts), so a new zip never reaches the database. */
export async function providerIdsWithinRadius(lat: number, lng: number, radiusMiles: number): Promise<string[]> {
  const located = await cachedQuery(["blog-paf-providers"], () =>
    db.provider.findMany({
      where: { latitude: { not: null }, longitude: { not: null } },
      select: { id: true, latitude: true, longitude: true },
    }),
  );
  return located.filter((p) => milesBetween(lat, lng, p.latitude!, p.longitude!) <= radiusMiles).map((p) => p.id);
}
