/**
 * IndexNow: tells Bing (and the other engines that share IndexNow) the
 * moment a page changes, instead of waiting for a recrawl. Bing feeds
 * ChatGPT search and Copilot. Google doesn't use IndexNow; for Google, use
 * Search Console's URL Inspection → Request Indexing (docs/onboarding-checklist.md).
 *
 * The key isn't a secret: IndexNow proves site ownership by fetching it from
 * public/<key>.txt. Always submits production URLs, since every sync and
 * article publish writes to the production database wherever it runs.
 */
const KEY = "6b62f2448c00730114b84c02788f3350";
const ORIGIN = "https://openairallergynetwork.com";

export type IndexNowResult = { submitted: number; status: string };

/** Submits site paths (e.g. "/blog/my-article"). Never throws. */
export async function notifyIndexNow(paths: string[]): Promise<IndexNowResult> {
  const urlList = [...new Set(paths)].map((p) => `${ORIGIN}${p}`);
  if (urlList.length === 0) return { submitted: 0, status: "nothing changed" };
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: new URL(ORIGIN).host, key: KEY, keyLocation: `${ORIGIN}/${KEY}.txt`, urlList }),
      signal: AbortSignal.timeout(10_000),
    });
    // 200 = accepted, 202 = accepted while the key is still being checked.
    return { submitted: urlList.length, status: res.ok ? `accepted (${res.status})` : `rejected (${res.status})` };
  } catch (err) {
    return { submitted: 0, status: `failed: ${(err as Error).message}` };
  }
}
