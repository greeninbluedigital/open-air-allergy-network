import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { db } from "@/lib/db";

/**
 * Page data caching (2026-10-30). Every page used to query Neon on every
 * visit, so crawlers and bots kept the database awake almost around the
 * clock and used up the free compute allowance. Pages now read through
 * `readDb` (or `cachedQuery` for raw SQL): the first visit stores the result
 * in Vercel's data cache and later visits reuse it, so the database only
 * wakes when something changed.
 *
 * Freshness comes from `refreshSiteCache()`, which the sync, the review
 * refresh and the publish scripts (via /api/revalidate) call after they
 * write. ONE_DAY is only a backstop for a write that skips it, e.g. a manual
 * SQL edit.
 *
 * Writes, the lead form, the sync and scripts keep using `db` directly:
 * they need live data, and next/cache only works inside the Next.js server.
 */

export const SITE_DATA_TAG = "site-data";
const ONE_DAY = 86400;

// The data cache stores JSON, which would turn Prisma's Date objects into
// strings. Wrap them on the way in and turn them back into Dates on the way
// out, so cached results look exactly like live ones.
function pack(value: unknown): string {
  return JSON.stringify(value ?? null, function (this: Record<string, unknown>, key, val) {
    const raw = this[key];
    return raw instanceof Date ? { $date: raw.toISOString() } : val;
  });
}

function unpack<T>(json: string): T {
  return JSON.parse(json, (_key, val) =>
    val && typeof val === "object" && typeof val.$date === "string" && Object.keys(val).length === 1
      ? new Date(val.$date)
      : val,
  ) as T;
}

/** Runs `run` once per `key` until the next refreshSiteCache() (or a day). */
export async function cachedQuery<T>(key: string[], run: () => Promise<T>): Promise<T> {
  const json = await unstable_cache(async () => pack(await run()), key, {
    tags: [SITE_DATA_TAG],
    revalidate: ONE_DAY,
  })();
  return unpack<T>(json);
}

const READ_OPERATIONS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
]);

/** The Prisma client for page reads: same API as `db`, with every model
 * read cached. Raw SQL ($queryRaw) isn't covered; wrap it in cachedQuery. */
export const readDb = db.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!READ_OPERATIONS.has(operation)) return query(args);
        return cachedQuery(["db", model, operation, JSON.stringify(args)], () => query(args));
      },
    },
  },
});

/** Clears every cached page and query, so the next visit to each page reads
 * fresh data. Call after anything that changes what the site shows. */
export function refreshSiteCache() {
  revalidateTag(SITE_DATA_TAG, { expire: 0 });
  revalidatePath("/", "layout");
  // Metadata routes sit outside the root layout.
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");
}
