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
 * write. SEVEN_DAYS is only a backstop for a write that skips it, e.g. a
 * manual SQL edit (was one day until 2026-10-31: daily expiry kept crawlers
 * waking the database all day as pages refilled).
 *
 * Writes, the lead form, the sync and scripts keep using `db` directly:
 * they need live data, and next/cache only works inside the Next.js server.
 */

export const SITE_DATA_TAG = "site-data";
const SEVEN_DAYS = 604800;

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

/** Runs `run` once per `key` until the next refreshSiteCache() (or a week).
 * Extra `tags` let a narrower refresh clear it too (refreshArticleCache). */
export async function cachedQuery<T>(key: string[], run: () => Promise<T>, tags: string[] = []): Promise<T> {
  const json = await unstable_cache(async () => pack(await run()), key, {
    tags: [SITE_DATA_TAG, ...tags],
    revalidate: SEVEN_DAYS,
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

const modelTag = (model: string) => `model:${model}`;

function cachingClient(prefix: string, withModelTags: boolean) {
  return db.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!READ_OPERATIONS.has(operation)) return query(args);
          return cachedQuery([prefix, model, operation, JSON.stringify(args)], () => query(args), withModelTags ? [modelTag(model)] : []);
        },
      },
    },
  });
}

/** The Prisma client for page reads: same API as `db`, with every model
 * read cached. Raw SQL ($queryRaw) isn't covered; wrap it in cachedQuery. */
export const readDb = cachingClient("db", true);

/**
 * Same as readDb, but only a full refreshSiteCache() clears it, not an
 * article publish. For the article reads every practice page makes (its
 * credited article count and feed): those change only when the sync changes
 * a credit, and the sync does a full refresh. Without this, each daily
 * publish would make every practice page reread the database on its next
 * crawl.
 */
export const creditReadDb = cachingClient("db-credit", false);

/** After an article publish (scripts/publish-article.ts via /api/revalidate):
 * clears only article data and the Blog and Learn pages, plus the sitemap and
 * llms.txt that list them. Practice pages stay cached (see creditReadDb). */
export function refreshArticleCache() {
  for (const model of ["Article", "ArticleFaqItem", "Author"]) revalidateTag(modelTag(model), { expire: 0 });
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/learn-about-ilit");
  revalidatePath("/learn-about-ilit/[slug]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");
}

/** Clears every cached page and query, so the next visit to each page reads
 * fresh data. Call after anything that changes what the site shows. */
export function refreshSiteCache() {
  revalidateTag(SITE_DATA_TAG, { expire: 0 });
  revalidatePath("/", "layout");
  // Metadata routes sit outside the root layout.
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");
}
